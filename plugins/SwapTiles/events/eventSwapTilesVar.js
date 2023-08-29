const id = "FO_EVENT_SWAP_TILES_VAR";
const groups = ["Tiles"];
const name = "Swap Tiles Var";

const fields = [

  {
    key: "tilemapName",
    label: "Tilemap Name",
    description: "The tilemap name is the name of the file of the files you want to swap in lowercase without file extensions.",
    type: "text",
    defaultValue: "",
    flexBasis: "100%",
  },

  {
    key: "tilesize",
    label: "Tile Size",
    description: "Choose the size of the tiles you wish to swap.",
    type: "select",
    width: "50%",
    options: [
      [1, "8x8"],
      [2, "16x16"]
    ],
    defaultValue: 1,
  },

  {
    key: "frames",
    label: "Frames of animation",
    description: "How many frames the animation has. Choose 1 for a one time tileswap.",
    type: "number",
    min: 1,
    width: "50%",
    defaultValue: 1,
  },

  {
    key: "wait",
    label: "Frames between swaps if animating",
    type: "number",
    min: 0,
    width: "50%",
    defaultValue: 0,
  },

  {
    type: "break",
  },

  {
    key: `tilex`,
    label: "Scene X",
    type: "union",
    types: ["number", "variable"],
    defaultType: "number",
    defaultValue: {
      number: 0,
      variable: "LAST_VARIABLE",
    },
    width: "50%",
  },

  {
    key: `tiley`,
    label: "Scene Y",
    type: "union",
    types: ["number", "variable"],
    defaultType: "number",
    defaultValue: {
      number: 0,
      variable: "LAST_VARIABLE",
    },
    width: "50%",
  },

  {
    key: `swapx`,
    label: "Tileset X",
    type: "number",
    defaultValue: 0,
    min: 0,
    width: "50%",
  },

  {
    key: `swapy`,
    label: "Tileset Y",
    type: "number",
    defaultValue: 0,
    min: 0,
    width: "50%",
  },

/*
  {
    key: "references",
    type: "references",
  },
  */
];

const compile = (input, helpers) => {
  const { 
    appendRaw, 
    compileReferencedAssets, 
    variableFromUnion,
    getVariableAlias,
    temporaryEntityVariable,
    wait,
    warnings
  } = helpers;

  const tilemap = input.tilemapName.toLowerCase();
  const skipRow = 20;
  const tilesize = input.tilesize;
  const frames = input.frames;

  //push 5 values to stack
  appendRaw(`
    VM_PUSH_CONST 0       \n .TILEX  = .ARG3
    VM_PUSH_CONST 0       \n .TILEY  = .ARG2
    VM_PUSH_CONST 0       \n .TILEID = .ARG1
    VM_PUSH_CONST 0 \n .SWAPID = .ARG0`
  );

  if(input[`tilex`].type === "variable")
    appendRaw(`VM_SET .TILEX, ${getVariableAlias(variableFromUnion(input[`tilex`], temporaryEntityVariable(0)))}`)
  else
    appendRaw(`VM_SET_CONST .TILEX, ${input.tilex.value}`);
  if(input[`tiley`].type === "variable")
    appendRaw(`VM_SET .TILEY, ${getVariableAlias(variableFromUnion(input[`tiley`], temporaryEntityVariable(0)))}`)
  else
    appendRaw(`VM_SET_CONST .TILEY, ${input.tiley.value}`);

  

  for (let i = 0; i < frames; i++) {
    appendRaw(`VM_GET_TILE_XY .TILEID, .TILEX, .TILEY`);
    appendRaw(`VM_SET_CONST .SWAPID, ${input.swapy * skipRow + input.swapx + (tilesize * i)}`);
    appendRaw(`VM_REPLACE_TILE .TILEID, ___bank_bg_${tilemap}_tileset, _bg_${tilemap}_tileset, .SWAPID, ${tilesize}`);
    if(tilesize == 2){
      appendRaw(`
      VM_RPN
        .R_REF .TILEY
        .R_INT8 1
        .R_OPERATOR .ADD
        .R_REF_SET .TILEY
        .R_REF .SWAPID
        .R_INT8 ${skipRow}
        .R_OPERATOR .ADD
        .R_REF_SET .SWAPID
        .R_STOP
      `);
      appendRaw(`VM_GET_TILE_XY .TILEID, .TILEX, .TILEY`);
      appendRaw(`VM_REPLACE_TILE .TILEID, ___bank_bg_${tilemap}_tileset, _bg_${tilemap}_tileset, .SWAPID, ${tilesize}`);
      appendRaw(`
      VM_RPN
        .R_REF .TILEY
        .R_INT8 1
        .R_OPERATOR .SUB
        .R_REF_SET .TILEY
        .R_STOP
      `);
    }
    wait(input.wait)
  }

  //clear stack
  appendRaw(`VM_POP 4`);


  /*
  if (input.references) {
    compileReferencedAssets(input.references);
  }
  */
};

module.exports = {
  id,
  name,
  groups,
  fields,
  references: ["/docs/scripting/gbvm/", "/docs/scripting/gbvm/gbvm-operations"],
  compile,
};