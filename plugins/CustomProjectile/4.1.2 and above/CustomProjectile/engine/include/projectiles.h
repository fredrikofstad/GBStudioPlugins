#ifndef PROJECTILES_H
#define PROJECTILES_H

#include <gbdk/platform.h>

#include "math.h"
#include "collision.h"
#include "gbs_types.h"

#define MAX_PROJECTILES 6
#define MAX_PROJECTILE_DEFS 5

extern projectile_def_t projectile_defs[MAX_PROJECTILE_DEFS];

void projectiles_init(void) BANKED;
void projectiles_update(void) NONBANKED;
void projectiles_render(void) NONBANKED;

#define PROJECTILE_ANIM_NOLOOP 0x01
#define PROJECTILE_STRONG 0x02

void projectile_launch(UBYTE index, point16_t *pos, UBYTE angle, UBYTE flags) BANKED;

extern UBYTE projectile_type;
extern UBYTE projectile_no_lifetime;
extern UBYTE projectile_no_bounds;
extern UBYTE projectile_collision;
extern UBYTE projectile_bounce;
extern BYTE projectile_gravity;

extern UBYTE projectile_actor;
extern BYTE projectile_distance;
extern BYTE projectile_distance2;
extern UINT8 projectile_amplitude;
extern UINT8 projectile_frequency;
extern UINT8 projectile_phase;

extern UBYTE projectile_flags;
extern UBYTE projectile_launch_orbit;
extern UBYTE projectile_delta_x;
extern UBYTE projectile_delta_y;

extern UBYTE projectile_hookshot_state;

#endif
