#pragma bank 255

#include "projectiles.h"

#include <gbdk/metasprites.h>
#include <string.h>

#include "scroll.h"
#include "actor.h"
#include "linked_list.h"
#include "game_time.h"
#include "vm.h"

#define FIXED 7

UBYTE projectile_type;
UBYTE projectile_no_lifetime;

UBYTE projectile_distance;

UINT8 projectile_amplitude;
UINT8 projectile_frequency;
UINT8 projectile_phase;

typedef enum {
    DEFAULT = 0,
    ARC,
    GRAVITY,
    BOOMERANG,
    SINE
} projectile_state;

projectile_t projectiles[MAX_PROJECTILES];
projectile_def_t projectile_defs[MAX_PROJECTILE_DEFS];
projectile_t *projectiles_active_head;
projectile_t *projectiles_inactive_head;

static UBYTE _save_bank;
static projectile_t *projectile;
static projectile_t *prev_projectile;


void handle_sine(projectile_t *projectile) NONBANKED {
    projectile->phase += projectile->frequency;
    projectile->phase %= 256; // phase between 0-255

    INT8 sine_value = SIN(projectile->phase);
    INT8 scaled_sine_value = ((sine_value * projectile->amplitude) >> FIXED);

    // Update position based on the sine wave
    switch (projectile->dir) {
        case DIR_RIGHT:
        case DIR_LEFT:
            projectile->pos.y -= scaled_sine_value;
            break;
        case DIR_UP:
        case DIR_DOWN:
            projectile->pos.x -= scaled_sine_value;
            break;
    }
    

    // projectile->pos.x += projectile->delta_pos.x;
}

void handle_gravity(projectile_t *projectile) NONBANKED {
    if (projectile->delta_pos.y == 0) {
        projectile->delta_pos.y = 65;
    } else {
        projectile->delta_pos.y -= 8;
        if (projectile->delta_pos.x < 0) {
            projectile->delta_pos.x += 1;
        } else if (projectile->delta_pos.x > 0) {
            projectile->delta_pos.x -= 1;
        }
    }
}

void remove_projectile(void) NONBANKED {
    projectile_t *next = projectile->next;
    LL_REMOVE_ITEM(projectiles_active_head, projectile, prev_projectile);
    LL_PUSH_HEAD(projectiles_inactive_head, projectile);
    projectile = next;
}

void handle_arc(projectile_t *projectile) NONBANKED {
    if (projectile->delta_pos.y > -40) {
        projectile->delta_pos.y -= 7;
    }
    WORD tile_x = ((projectile->pos.x) >> 7) + 1;
    WORD tile_y = (projectile->pos.y) >> 7;
    if (tile_at(tile_x, tile_y + 1) & COLLISION_TOP) {
        projectile->delta_pos.y = 50;
    }
    if (tile_at(tile_x, tile_y) & (COLLISION_LEFT | COLLISION_RIGHT)) {
        remove_projectile();
    }
}

void handle_boomerang(projectile_t *projectile) NONBANKED {
    switch (projectile->dir) {
        case DIR_RIGHT:
           projectile->delta_pos.x -= 1;
            break;
        case DIR_LEFT:
            projectile->delta_pos.x += 1;
            break;
        case DIR_UP:
            projectile->delta_pos.y -= 1;
            break;
        case DIR_DOWN:
            projectile->delta_pos.y += 1;
            break;
    }
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

        // Move projectile
        projectile->pos.x += projectile->delta_pos.x;
        projectile->pos.y -= projectile->delta_pos.y;

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

            switch (projectile_type) {
                case DEFAULT:
                    break;
                case GRAVITY:
                    handle_gravity(projectile);
                    break;
                case ARC:
                    handle_arc(projectile);
                    break;
                case BOOMERANG:
                    handle_boomerang(projectile);
                    break;
                case SINE:
                    handle_sine(projectile);
                    break;
            }
        } 

        UBYTE screen_x = (projectile->pos.x >> 4) - draw_scroll_x + 8,
              screen_y = (projectile->pos.y >> 4) - draw_scroll_y + 8;

        if (screen_x > 160 || screen_y > 144) {
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

void projectile_launch(UBYTE index, upoint16_t *pos, UBYTE angle, UBYTE flags) BANKED {
    projectile_t *projectile = projectiles_inactive_head;
    if (projectile) {
        memcpy(&projectile->def, &projectile_defs[index], sizeof(projectile_def_t));

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

        projectile->amplitude = projectile_amplitude;   // Set amplitude of sine wave
        projectile->frequency = projectile_frequency;    // Set frequency of sine wave
        projectile->phase = projectile_phase;         // Starting phase for sine


        point_translate_angle_to_delta(&projectile->delta_pos, angle, projectile->def.move_speed);

        LL_REMOVE_HEAD(projectiles_inactive_head);
        LL_PUSH_HEAD(projectiles_active_head, projectile);
    }
}
