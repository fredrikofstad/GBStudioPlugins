#ifndef STATE_TOP_DOWN_H
#define STATE_TOP_DOWN_H

#include <gbdk/platform.h>

void paper_init(void) BANKED;
void paper_update(void) BANKED;

extern UBYTE paper_grid;
extern UBYTE follow;
extern UBYTE partner;

#endif
