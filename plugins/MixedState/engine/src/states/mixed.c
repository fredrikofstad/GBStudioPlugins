#pragma bank 255

#include "data/states_defines.h"
#include "states/mixed.h"
#include "states/topdown.h"
#include "states/platform.h"
#include "states/adventure.h"
#include "states/shmup.h"
#include "states/pointnclick.h"
#include "states/logo.h"

UBYTE CURRENT_STATE;
UBYTE state;

enum Level {
  TOPDOWN = 0,
  PLATFORM,
  ADVENTURE,
  SHMUP,
  POINTNCLICK,
  LOGO,
};

void mixed_init(void) BANKED {
    switch (CURRENT_STATE)
    {
    case TOPDOWN:
        topdown_init();
        break;
    
    case PLATFORM:
        platform_init();
        break;
    
    case ADVENTURE:
        adventure_init();
        break;

    case SHMUP:
        shmup_init();
        break;

    case POINTNCLICK:
        pointnclick_init();
        break;

    case LOGO:
        logo_init();
        break;
    
    default:
        topdown_init();
        break;
    }
    state = CURRENT_STATE;
}


void mixed_update(void) BANKED {
    if(state != CURRENT_STATE) mixed_init();
    switch (CURRENT_STATE)
    {
    case TOPDOWN:
        topdown_update();
        break;
    
    case PLATFORM:
        platform_update();
        break;
    
    case ADVENTURE:
        adventure_update();
        break;

    case SHMUP:
        shmup_update();
        break;

    case POINTNCLICK:
        pointnclick_update();
        break;

    case LOGO:
        logo_update();
        break;

    default:
        topdown_update();
        break;
    }
    
}
