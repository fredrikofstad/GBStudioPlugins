const id = "FO_EVENT_UI_NUM";
const groups = ["Tiles"];
const name = "UI Number Tiles";

const fields = [].concat(
  [

    {
      key: "tilemapName",
      label: "UI Tilemap",
      type: "text",
      width: "50%",
    },
    {
      key: "tileLength",
      label: "Length Of Tilemap",
      description: "How many tiles your tilemap has in the X axis",
      type: "number",
      min: 0,
      width: "50%",
      defaultValue: 20,
    },

    {
      key: `tile_x`,
      type: "start",
      label: `Start Tile's X in BG`,
      type: "number",
      defaultValue: 0,
      min: 0,
      width: "50%",
    },
    {
      key: `tile_y`,
      type: "number",
      label: `Start Tile's Y in BG`,
      type: "number",
      defaultValue: 0,
      min: 0,
      width: "50%",
    },

    {
      key: `swap_x`,
      label: `X coordinate of 0 in tilesheet`,
      description: "X coordinate of the starting tile in the tileset you will be swapping to.",
      type: "number",
      defaultValue: 0,
      min: 0,
      width: "50%",
    },
    {
      key: `swap_y`,
      label: `Y coordinate of 0 in tilesheet`,
      description: "Y coordinate of the starting tile in the tileset you will be swapping to.",
      type: "number",
      defaultValue: 0,
      min: 0,
      width: "50%",
    },

    {
      key: `var`,
      label: `Variable`,
      description: "Variable of number to show",
      type: "variable",
      defaultValue: "LAST_VARIABLE",
      min: 0,
      width: "50%",
    },

    {
      key: `size`,
      label: "Digit Tile Size",
      description: "Choose the size of the tiles",
      type: "select",
      width: "50%",
      options: [
        [1, "8x8"],
        [2, "8x16"],
        [4, "16x16"]
      ],
      defaultValue: 1,
    },
    {
      key: `figures`,
      label: "How many figures to show",
      description: "Ex: 045",
      type: "number",
      width: "50%",
      min: 1,
      max: 5,
      defaultValue: 1,
    },
]);

const compile = (input, helpers) => {
    const {
        appendRaw,
        warnings,
        getVariableAlias,
    } = helpers;

    const tilemap = input.tilemapName.toLowerCase();
    const length = input.tileLength;
    
    const size = input[`size`];
    const figures = input[`figures`];
    const xOffset = size == 4 ? 2 : 1;
    let x = input[`tile_x`] + figures * xOffset - xOffset;
    const y = input[`tile_y`];
    const swapX = input[`swap_x`];
    const swapY = input[`swap_y`];
    const num = getVariableAlias(input[`var`]);

    const ones = `.R_REF ${num}\n.R_INT8 10\n.R_OPERATOR .MOD\n.R_INT8 1\n.R_OPERATOR .DIV`;
    const tens = `.R_REF ${num}\n.R_INT8 100\n.R_OPERATOR .MOD\n.R_INT8 10\n.R_OPERATOR .DIV`;
    const hundreds = `.R_REF ${num}\n.R_INT16 1000\n.R_OPERATOR .MOD\n.R_INT8 100\n.R_OPERATOR .DIV`;
    const thousands = `.R_REF ${num}\n.R_INT16 10000\n.R_OPERATOR .MOD\n.R_INT16 1000\n.R_OPERATOR .DIV`;
    const tenthousands = `.R_REF ${num}\n.R_INT16 10000\n.R_OPERATOR .DIV`;
    const number = [ones, tens, hundreds, thousands, tenthousands];

    const tileIndex = swapY * length + swapX;
    const currentIndex = [tileIndex, tileIndex + length, tileIndex+1, tileIndex + length + 1];

    let currentX = [x, x, x + 1, x + 1];
    const currentY = [y, y + 1, y, y + 1];


    for(let i = 0; i < figures; i++){
      for(let j = 0; j < size; j++){
        appendRaw(`VM_RPN`);
        appendRaw(number[i]);
        appendRaw(`.R_INT8 ${xOffset}`);
        appendRaw(`.R_OPERATOR .MUL`);
        appendRaw(`.R_INT8 ${currentIndex[j]}`);
        appendRaw(`.R_OPERATOR .ADD`);
        appendRaw(`.R_STOP`);
        appendRaw(`VM_REPLACE_TILE_XY ${currentX[j]}, ${currentY[j]}, ___bank_bg_${tilemap}_tileset, _bg_${tilemap}_tileset, .ARG0`);
        appendRaw(`VM_POP 1`);
      }
      x -= xOffset;
      currentX = [x, x, x + 1, x + 1];
    }
    

};



module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
  };

