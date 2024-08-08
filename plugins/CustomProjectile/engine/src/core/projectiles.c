#pragma bank 255

#include "projectiles.h"

#include <gbdk/metasprites.h>
#include <string.h>

#include "scroll.h"
#include "actor.h"
#include "linked_list.h"
#include "game_time.h"
#include "vm.h"
#include "data/game_globals.h"

#define FIXED 7

UBYTE projectile_type;
UBYTE projectile_no_lifetime;
UBYTE projectile_no_bounds;
UBYTE projectile_collision;
UBYTE projectile_bounce;
BYTE projectile_gravity;

UBYTE projectile_actor;
BYTE projectile_distance;
BYTE projectile_distance2;

UBYTE projectile_amplitude;
UBYTE projectile_frequency;
UBYTE projectile_phase;

UBYTE projectile_flags;
UBYTE projectile_delta_x;
UBYTE projectile_delta_y;

typedef enum {
    DEFAULT = 0,
    ARC,
    BOOMERANG,
    SINE,
    ORBIT,
    CUSTOM,
    //HOMING,
} projectile_state;

projectile_t projectiles[MAX_PROJECTILES];
projectile_def_t projectile_defs[MAX_PROJECTILE_DEFS];
projectile_t *projectiles_active_head;
projectile_t *projectiles_inactive_head;

static UBYTE _save_bank;
static projectile_t *projectile;
static projectile_t *prev_projectile;

int16_t sine;
int16_t cosine;
int16_t x_offset;
int16_t y_offset;

void update_phase(void) BANKED {
    projectile->phase += projectile->frequency;
    projectile->phase %= 256;
    sine = ((SIN(projectile->phase) * projectile->amplitude) >> FIXED) * 2;
}

void handle_sine(void) BANKED {
    update_phase();
    
    // Update position based on the sine wave

    switch (projectile->dir) {
        case DIR_RIGHT:
        case DIR_LEFT:
            projectile->pos.y -= sine;
            break;
        case DIR_UP:
        case DIR_DOWN:
            projectile->pos.x -= sine;
            break;
    }
}

void handle_custom(void) BANKED {
    projectile->pos.x += *(script_memory + projectile_delta_x);
    projectile->pos.y += *(script_memory + projectile_delta_y);
}

void handle_orbit(void) BANKED {
    update_phase();
    // Calculate the new position using sine and cosine for orbit
    cosine = ((COS(projectile->phase) * projectile->amplitude) >> FIXED) * 2;   

    if (projectile_flags) {
        switch (actors[projectile_actor].dir) {
            case DIR_RIGHT:
                x_offset += projectile->def.move_speed;
                break;
            case DIR_LEFT:
                x_offset -= projectile->def.move_speed;
                break;
            case DIR_UP:
                y_offset += projectile->def.move_speed;
                break;
            case DIR_DOWN:
                y_offset -= projectile->def.move_speed;
                break;
        }
    }
    // Update projectile position based on center point
    projectile->pos.x = actors[projectile_actor].pos.x + cosine + (projectile->x) + x_offset;
    projectile->pos.y = actors[projectile_actor].pos.y + sine + (projectile->y) + y_offset;
}

// WIP
/*
void handle_homing(projectile_t *projectile) BANKED {
    int16_t dx = (actors[projectile_actor].pos.x - projectile->pos.x)/128;
    int16_t dy = (actors[projectile_actor].pos.y - projectile->pos.y)/128;

    UBYTE angle = atan2(dx, dy);
    *(script_memory + 0) = angle; // debug to see angle as first var
    point_translate_angle_to_delta(&projectile->delta_pos, 255-angle, projectile->def.move_speed);
}
*/


void handle_boomerang(void) BANKED {

    switch (projectile->dir) {
        case DIR_RIGHT:
            projectile->delta_pos.x -= projectile_distance;
            break;
        case DIR_LEFT:
            projectile->delta_pos.x += projectile_distance;
            break;
        case DIR_UP:
            projectile->delta_pos.y -= projectile_distance;
            break;
        case DIR_DOWN:
            projectile->delta_pos.y += projectile_distance;
            break;
    }
}




void remove_projectile(void) NONBANKED {
    if(projectile_flags) {
        *(script_memory + projectile_delta_x) = projectile->pos.x/16;
        *(script_memory + projectile_delta_y) = projectile->pos.y/16;
    }
    projectile_t *next = projectile->next;
    LL_REMOVE_ITEM(projectiles_active_head, projectile, prev_projectile);
    LL_PUSH_HEAD(projectiles_inactive_head, projectile);
    projectile = next;
}

void handle_types(void) BANKED {
    switch (projectile->type) {
        case BOOMERANG:
            handle_boomerang();
            break;
        case SINE:
            handle_sine();
            break;
        case ORBIT:
            handle_orbit();
            break;
        case CUSTOM:
            handle_custom();
            break;
        //case HOMING:
        //    handle_homing(projectile);
        //    break;
    }
}

bool handle_bounce(void) BANKED {
    if(projectile_collision == 0){
        return false;
    }
    WORD tile_x = ((projectile->pos.x) >> FIXED) + 1;
    WORD tile_y = (projectile->pos.y) >> FIXED;

    if(projectile_collision == 1){
        if(tile_at(tile_x, tile_y) & COLLISION_ALL) {
        remove_projectile();
        return true;
        }
    } else {
        if (tile_at(tile_x, tile_y + 1) & COLLISION_TOP) {
            projectile->delta_pos.y = projectile->bounce;
        }

        if(projectile_collision == 3) return false; // if only floor collision

        if (tile_at(tile_x, tile_y - 1) & COLLISION_BOTTOM) {
            projectile->delta_pos.y = -projectile->bounce;
        }
        if (tile_at(tile_x + 1, tile_y) & COLLISION_RIGHT) {
            projectile->delta_pos.x = -projectile->bounce;
        }
        if (tile_at(tile_x - 1, tile_y) & COLLISION_LEFT) {
            projectile->delta_pos.x = projectile->bounce;
        } 
    }
    
    return false;
}


void projectiles_init(void) BANKED {
    projectiles_active_head = projectiles_inactive_head = NULL;
    for (projectile_t * proj = projectiles; proj < (projectiles + MAX_PROJECTILES); ++proj) {
        LL_PUSH_HEAD(projectiles_inactive_head, proj);
    }
}

void projectiles_update(void) NONBANKED {
    projectile = projectiles_active_head;
    prev_projectile = NULL;

    _save_bank = CURRENT_BANK;

    while (projectile) {
        if (projectile->def.life_time == 0) {
            // Remove projectile
            remove_projectile();
            continue;
        }
        if(!projectile_no_lifetime){
            projectile->def.life_time--;
        }

        // Check reached animation tick frame
        if ((game_time & projectile->def.anim_tick) == 0) {
            projectile->frame++;
            // Check reached end of animation
            if (projectile->frame == projectile->frame_end) {
                if (!projectile->anim_noloop) {
                    projectile->frame = projectile->frame_start;
                } else {
                    projectile->frame--;
                }
            }
        }

        if (IS_FRAME_EVEN) {
            actor_t *hit_actor = actor_overlapping_bb(&projectile->def.bounds, &projectile->pos, NULL, FALSE);
            if (hit_actor && (hit_actor->collision_group & projectile->def.collision_mask)) {
                // Hit! - Fire collision script here
                if ((hit_actor->script.bank) && (hit_actor->hscript_hit & SCRIPT_TERMINATED)) {
                    script_execute(hit_actor->script.bank, hit_actor->script.ptr, &(hit_actor->hscript_hit), 1, (UWORD)(projectile->def.collision_group));
                }
                if (!projectile->strong) {
                    // Remove projectile
                    remove_projectile();
                    continue;
                }
            }
        

            handle_types();
            if(handle_bounce()){
                continue;
            }
            if(projectile->gravity){
                projectile->delta_pos.y -= projectile->gravity;
            }
        } 

        // Move projectile
        if(projectile->type != CUSTOM && projectile->type != ORBIT){
            projectile->pos.x += projectile->delta_pos.x;
            projectile->pos.y -= projectile->delta_pos.y;
        }

        UBYTE screen_x = (projectile->pos.x >> 4) - draw_scroll_x + 8,
              screen_y = (projectile->pos.y >> 4) - draw_scroll_y + 8;

        if (!projectile_no_bounds && (screen_x > 160 || screen_y > 144)) {
            // Remove projectile
            remove_projectile();
            continue;
        }

        SWITCH_ROM(projectile->def.sprite.bank);
        spritesheet_t *sprite = projectile->def.sprite.ptr;

        allocated_hardware_sprites += move_metasprite(
            *(sprite->metasprites + projectile->frame),
            projectile->def.base_tile,
            allocated_hardware_sprites,
            screen_x,
            screen_y
        );

        prev_projectile = projectile;
        projectile = projectile->next;
    }

    SWITCH_ROM(_save_bank);
}

void projectiles_render(void) NONBANKED {
    projectile = projectiles_active_head;
    prev_projectile = NULL;

    _save_bank = _current_bank;

    while (projectile) {
        UINT8 screen_x = ((projectile->pos.x >> 4) + 8) - draw_scroll_x,
              screen_y = ((projectile->pos.y >> 4) + 8) - draw_scroll_y;

        if ((screen_x > DEVICE_SCREEN_PX_WIDTH) || (screen_y > DEVICE_SCREEN_PX_HEIGHT)) {
            remove_projectile();
            continue;
        }

        SWITCH_ROM(projectile->def.sprite.bank);
        spritesheet_t *sprite = projectile->def.sprite.ptr;

        allocated_hardware_sprites += move_metasprite(
            *(sprite->metasprites + projectile->frame),
            projectile->def.base_tile,
            allocated_hardware_sprites,
            screen_x,
            screen_y
        );

        prev_projectile = projectile;
        projectile = projectile->next;
    }

    SWITCH_ROM(_save_bank);
}

void projectile_launch(UBYTE index, upoint16_t *pos, UBYTE angle, UBYTE flags) BANKED {
    projectile_t *projectile = projectiles_inactive_head;
    if (projectile) {
        memcpy(&projectile->def, &projectile_defs[index], sizeof(projectile_def_t));

        projectile->type = projectile_type;
        // Set correct projectile frames based on angle
        projectile->dir = DIR_UP;
        if (angle <= 224) {
            if (angle >= 160) {
                projectile->dir = DIR_LEFT;
            } else if (angle > 96) {
                projectile->dir = DIR_DOWN;
            } else if (angle >= 32) {
                projectile->dir = DIR_RIGHT;
            }
        }

        // set projectile flags
        projectile->anim_noloop = (flags & PROJECTILE_ANIM_NOLOOP);
        projectile->strong = (flags & PROJECTILE_STRONG);

        // set animation
        projectile->frame = projectile->def.animations[projectile->dir].start;
        projectile->frame_start = projectile->def.animations[projectile->dir].start;
        projectile->frame_end = projectile->def.animations[projectile->dir].end + 1;

        // set coordinates
        UINT16 initial_offset = projectile->def.initial_offset;
        projectile->pos.x = pos->x;
        projectile->pos.y = pos->y;

        INT8 sinv = SIN(angle), cosv = COS(angle);

        // Offset by initial amount
        while (initial_offset > 0xFFu) {
            projectile->pos.x += ((sinv * (UINT8)(0xFF)) >> 7);
            projectile->pos.y -= ((cosv * (UINT8)(0xFF)) >> 7);
            initial_offset -= 0xFFu;
        }
        if (initial_offset > 0) {
            projectile->pos.x += ((sinv * (UINT8)(initial_offset)) >> 7);
            projectile->pos.y -= ((cosv * (UINT8)(initial_offset)) >> 7);
        }

        projectile->amplitude = projectile_amplitude;    // Set amplitude of sine wave
        projectile->frequency = projectile_frequency;    // Set frequency of sine wave
        projectile->phase = projectile_phase;            // Starting phase for sine
        projectile->gravity = projectile_gravity;        // Gravity for projectile
        projectile->bounce = projectile_bounce;          // Bounce height 
        projectile->x = projectile_distance;             // Used for
        projectile->y = projectile_distance2;            // Used for
        projectile->flags = projectile_flags;            // Used for launching orbit, or callback on removal

        x_offset = 0;
        y_offset = 0;

        point_translate_angle_to_delta(&projectile->delta_pos, angle, projectile->def.move_speed);

        if(projectile->type == ARC){
            projectile->delta_pos.y = projectile->y;
        }

        LL_REMOVE_HEAD(projectiles_inactive_head);
        LL_PUSH_HEAD(projectiles_active_head, projectile);
    }
}
