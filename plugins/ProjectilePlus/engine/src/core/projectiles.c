#pragma bank 255

#include "projectiles.h"

#include <gbdk/metasprites.h>
#include <string.h>

#include "scroll.h"
#include "actor.h"
#include "linked_list.h"
#include "game_time.h"
#include "vm.h"

UBYTE projectile_type;

typedef enum {
    DEFAULT = 0,
    ARC,
    GRAVITY,
    BOOMERANG
} projectile_state;

projectile_t projectiles[MAX_PROJECTILES];
projectile_def_t projectile_defs[MAX_PROJECTILE_DEFS];
projectile_t *projectiles_active_head;
projectile_t *projectiles_inactive_head;

void projectiles_init(void) BANKED {
    projectiles_active_head = projectiles_inactive_head = NULL;
    for (projectile_t * proj = projectiles; proj < (projectiles + MAX_PROJECTILES); ++proj) {
        LL_PUSH_HEAD(projectiles_inactive_head, proj);
    }
}

static UBYTE _save_bank;
static projectile_t *projectile;
static projectile_t *prev_projectile;

void projectiles_update(void) NONBANKED {
    projectile_t *next;

    projectile = projectiles_active_head;
    prev_projectile = NULL;

    _save_bank = CURRENT_BANK;

    while (projectile) {
        if (projectile->def.life_time == 0) {
            // Remove projectile
            next = projectile->next;
            LL_REMOVE_ITEM(projectiles_active_head, projectile, prev_projectile);
            LL_PUSH_HEAD(projectiles_inactive_head, projectile);
            projectile = next;
            continue;
        }
        projectile->def.life_time--;

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
                    next = projectile->next;
                    LL_REMOVE_ITEM(projectiles_active_head, projectile, prev_projectile);
                    LL_PUSH_HEAD(projectiles_inactive_head, projectile);
                    projectile = next;
                    continue;
                }
            }
        } else {

            switch (projectile_type) {
                case DEFAULT: break;
                case GRAVITY:
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
                    break;

                case ARC:
                    if (projectile->delta_pos.y > -40) {
                        projectile->delta_pos.y -= 7;
                    }
                    WORD tile_x = ((projectile->pos.x) >> 7) + 1;
                    WORD tile_y = (projectile->pos.y) >> 7;
                    // floor below
                    if (tile_at(tile_x, tile_y + 1) & COLLISION_TOP) {
                        // bounce
                        projectile->delta_pos.y = 50;
                    }
                    // collided with wall
                    if (tile_at(tile_x, tile_y) & (COLLISION_LEFT | COLLISION_RIGHT)) {
                        // Remove projectile
                        projectile_t *next = projectile->next;
                        LL_REMOVE_ITEM(projectiles_active_head, projectile, prev_projectile);
                        LL_PUSH_HEAD(projectiles_inactive_head, projectile);
                        projectile = next;
                        continue;
                    }
                    break;
                    
                case BOOMERANG:
                    switch (projectile->dir) {
                        case DIR_RIGHT:
                            if (projectile->delta_pos.x > -6 && projectile->delta_pos.x < 6) {
                                projectile->delta_pos.x -= 2;
                            } else if (projectile->delta_pos.x > -16 && projectile->delta_pos.x < 16) {
                                projectile->delta_pos.x -= 2;
                            } else {
                                projectile->delta_pos.x -= 3;
                            }
                            break;

                        case DIR_LEFT:
                             if (projectile->delta_pos.x > -6 && projectile->delta_pos.x < 6) {
                                projectile->delta_pos.x += 2;
                            } else if (projectile->delta_pos.x > -16 && projectile->delta_pos.x < 16) {
                                projectile->delta_pos.x += 2;
                            } else {
                                projectile->delta_pos.x += 3;
                            }
                            break;
                        case DIR_UP:
                            if (projectile->delta_pos.y > -6 && projectile->delta_pos.y < 6) {
                                projectile->delta_pos.y -= 1;
                            } else if (projectile->delta_pos.y > -16 && projectile->delta_pos.y < 16) {
                                projectile->delta_pos.y -= 2;
                            } else {
                                projectile->delta_pos.y -= 3;
                            }
                            break;
                        case DIR_DOWN:
                            if (projectile->delta_pos.y > -6 && projectile->delta_pos.y < 6) {
                                projectile->delta_pos.y += 1;
                            } else if (projectile->delta_pos.y > -16 && projectile->delta_pos.y < 16) {
                                projectile->delta_pos.y += 2;
                            } else {
                                projectile->delta_pos.y += 3;
                            }
                            break;
                    }

                    break;
            }
        }

        UINT8 screen_x = (projectile->pos.x >> 4) - draw_scroll_x + 8,
              screen_y = (projectile->pos.y >> 4) - draw_scroll_y + 8;

        if (screen_x > 160 || screen_y > 144) {
            // Remove projectile
            projectile_t *next = projectile->next;
            LL_REMOVE_ITEM(projectiles_active_head, projectile, prev_projectile);
            LL_PUSH_HEAD(projectiles_inactive_head, projectile);
            projectile = next;
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
        UINT8 screen_x = (projectile->pos.x >> 4) - draw_scroll_x + 8,
              screen_y = (projectile->pos.y >> 4) - draw_scroll_y + 8;

        if (screen_x > 160 || screen_y > 144) {
            // Remove projectile
            projectile_t *next = projectile->next;
            LL_REMOVE_ITEM(projectiles_active_head, projectile, prev_projectile);
            LL_PUSH_HEAD(projectiles_inactive_head, projectile);
            projectile = next;
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

        point_translate_angle_to_delta(&projectile->delta_pos, angle, projectile->def.move_speed);

        LL_REMOVE_HEAD(projectiles_inactive_head);
        LL_PUSH_HEAD(projectiles_active_head, projectile);
    }
}
