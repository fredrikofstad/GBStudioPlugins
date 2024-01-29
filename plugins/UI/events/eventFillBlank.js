const id = "FO_EVENT_UI_BLANK";
const groups = ["Tiles"];
const name = "UI Fill Blank";

const fields = [].concat(
  [
    {
      key: "tilemapName",
      label: "Tilemap",
      description: "The tilemap you want to swap tiles with",
      type: "background",
      defaultValue: "",
      flexBasis: "100%",
    },

    {
      key: `tile_x`,
      type: "start",
      label: `X coordinate of start tile in BG`,
      type: "number",
      defaultValue: 0,
      min: 0,
      width: "50%",
    },
    {
      key: `tile_y`,
      type: "number",
      label: `Y coordinate of start tile in BG`,
      type: "number",
      defaultValue: 0,
      min: 0,
      width: "50%",
    },

    {
      key: `swap_x`,
      label: `X coordinate of blank tile in tilesheet`,
      description: "X coordinate of the starting tile in the tileset you will be swapping to.",
      type: "number",
      defaultValue: 0,
      min: 0,
      width: "50%",
    },
    {
      key: `swap_y`,
      label: `Y coordinate of blank tile in tilesheet`,
      description: "Y coordinate of the starting tile in the tileset you will be swapping to.",
      type: "number",
      defaultValue: 0,
      min: 0,
      width: "50%",
    },

    {
      key: `row_amount`,
      label: "How many rows",
      description: "",
      type: "number",
      width: "50%",
      min: 1,
      defaultValue: 1,
    },

    {
      key: `row_length`,
      label: "The length of the rows",
      description: "",
      type: "number",
      width: "50%",
      min: 1,
      defaultValue: 1,
    },

]);

const compile = (input, helpers) => {
    const {
        appendRaw,
        backgrounds,
    } = helpers;

    const bg = backgrounds.find((background) => background.id === input.tilemapName);
    const tilemap = bg.symbol;
    const length = bg.width;

    const staticX = input[`tile_x`];
    let currentX = staticX;
    let currentY = input[`tile_y`];
    const swapX = input[`swap_x`];
    const swapY = input[`swap_y`];
    const rowLength = input[`row_length`];
    const rowAmount = input[`row_amount`];
    const tileIndex = swapY * length + swapX;
    const Xlimit = rowLength + currentX - 1;

    const loopMax = rowLength * rowAmount;

    appendRaw(`VM_PUSH_CONST ${tileIndex}`);
    
    for (let i = 0; i < loopMax; i++) {
      appendRaw(`VM_REPLACE_TILE_XY ${currentX}, ${currentY}, ___bank_${tilemap}_tileset, _${tilemap}_tileset, .ARG0`);
      if(currentX == Xlimit){
        currentY++;
        currentX = staticX;
      } else {
        currentX++;
      }  
    }
    appendRaw(`VM_POP 1`);
  };



module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
  };

