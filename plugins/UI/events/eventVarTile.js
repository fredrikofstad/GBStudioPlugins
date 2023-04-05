const id = "FO_EVENT_UI_VAR";
const groups = ["Plugins"];
const name = "UI Variable Tiles";

const MAX_TILES = 20;

const fields = [].concat(
  [

    {
      key: "tilemapName",
      label: "UI Tilemap",
      type: "text",
      defaultValue: "hud",
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
      key: "items",
      label: "Tile Amount",
      description: "Tiles that will change based on variables",
      type: "number",
      min: 1,
      max: MAX_TILES,
      defaultValue: 1,
    },
    {
      type: "break",
    },

    
    ...Array(MAX_TILES)
      .fill()
      .reduce((arr, _, i) => {
        const index = i + 1;
        arr.push(
          {
            key: `collapseTile${index}`,
            label: `Tile${index}`,
            conditions: [
              {
                key: "items",
                gte: index,
              }
            ],
            type: "collapsable",
          },
          {
            key: `tile${index}_x`,
            type: "number",
            label: `Tile ${index}'s X in BG`,
            type: "number",
            defaultValue: 0,
            min: 0,
            width: "50%",
            conditions: [
              {
                key: "items",
                gte: index,
              },
              {
                key: `collapseTile${index}`,
                ne: true
              },
            ],
          },
          {
            key: `tile${index}_y`,
            type: "number",
            label: `Tile ${index}'s Y in BG`,
            type: "number",
            defaultValue: 0,
            min: 0,
            width: "50%",
            conditions: [
              {
                key: "items",
                gte: index,
              },
              {
                key: `collapseTile${index}`,
                ne: true
              },
            ],
          },

          {
            key: `swap${index}_x`,
            label: `Tile ${index}'s starting X value in tilesheet`,
            description: "X coordinate of the starting tile in the tileset you will be swapping to.",
            type: "number",
            defaultValue: 0,
            min: 0,
            width: "50%",
            conditions: [
              {
                key: "items",
                gte: index,
              },
              {
                key: `collapseTile${index}`,
                ne: true
              },
            ],
          },
          {
            key: `swap${index}_y`,
            label: `Tile ${index}'s starting Y value in tilesheet`,
            description: "Y coordinate of the starting tile in the tileset you will be swapping to.",
            type: "number",
            defaultValue: 0,
            min: 0,
            width: "50%",
            conditions: [
              {
                key: "items",
                gte: index,
              },
              {
                key: `collapseTile${index}`,
                ne: true
              },
            ],
          },

          {
            key: `var${index}`,
            label: `Variable`,
            description: "The variable to determine the frame",
            type: "variable",
            defaultValue: 4,
            width: "50%",
            conditions: [
              {
                key: "items",
                gte: index,
              },
              {
                key: `collapseTile${index}`,
                ne: true
              },
            ],
          },

          {
            key: `size${index}`,
            label: "Tile Size",
            description: "Choose the size of the tiles",
            type: "select",
            width: "50%",
            options: [
            [1, "8x8"],
            [2, "8x16"],
            [4, "16x16"]
            ],
            defaultValue: "8",
            conditions: [
              {
                key: "items",
                gte: index,
              },
              {
                key: `collapseTile${index}`,
                ne: true
              },
            ],
          },
        );
        return arr;
      }, []),

  ]
);

const compile = (input, helpers) => {
    const {
        appendRaw,
        warnings,
        getVariableAlias,
    } = helpers;

    const items = input.items;
    const tilemap = input.tilemapName.toLowerCase();
    const length = input.tileLength;

    for(let i = 1; i <= items; i++) {
      const x = input[`tile${i}_x`];
      const y = input[`tile${i}_y`];
      const swapX = input[`swap${i}_x`];
      const swapY = input[`swap${i}_y`];
      const size = input[`size${i}`]
      const frame = getVariableAlias(input[`var${i}`]);
      const skipAmount = size == 4 ? 2 : frame == 0 ? 0 : 1;

      //warnings(`${frame}`);

      let currentIndex = swapY * length + swapX;
      
      const currentX = [x, x, x + 1, x + 1];
      const currentY = [y, y + 1, y, y + 1];
      const tileIndex = [currentIndex, currentIndex + length, currentIndex+1, currentIndex + length + 1];

      for(let j = 0; j < size; j++){
        appendRaw(`VM_RPN`);
        appendRaw(`.R_REF ${frame}`);
        appendRaw(`.R_INT8 ${skipAmount}`);
        appendRaw(`.R_OPERATOR .MUL`);
        appendRaw(`.R_INT8 ${tileIndex[j]}`);
        appendRaw(`.R_OPERATOR .ADD`);
        appendRaw(`.R_STOP`);
        appendRaw(`VM_REPLACE_TILE_XY ${currentX[j]}, ${currentY[j]}, ___bank_bg_${tilemap}_tileset, _bg_${tilemap}_tileset, .ARG0`);
        appendRaw(`VM_POP 1`);
      }

    }

};

module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
  };

