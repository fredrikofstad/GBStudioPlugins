const id = "FO_EVENT_SWAP_TILES";
const groups = ["Plugins"];
const name = "Swap Tiles";

const MAX_TILES = 20;

const fields = [].concat(
  [
    {
      key: "tileAmount",
      label: "Tile Size",
      description: "Choose the size of the tiles you wish to animate.",
      type: "select",
      width: "50%",
      options: [
      ["single", "8x8"],
      ["four", "16x16"]
      ],
      defaultValue: "single",
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
      key: "items",
      label: "Number of tiles to be swapped",
      description: "How many unique tiles to be swapped in one loop",
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
            type: "break",
            conditions: [
              {
                key: "items",
                gte: index,
              },
            ],
          },
          {
            key: `tile${index}_x`,
            type: "number",
            label: `Unique Tile ${index}'s X`,
            defaultValue: 0,
            width: "50%",
            conditions: [
              {
                key: "items",
                gte: index,
              },
            ],
          },
          {
            key: `tile${index}_y`,
            type: "number",
            label: `Unique Tile ${index}'s Y`,
            defaultValue: 0,
            width: "50%",
            conditions: [
              {
                key: "items",
                gte: index,
              },
            ],
          },


          {
            type: "break",
            conditions: [
              {
                key: "items",
                gte: index,
              },
            ],
          },

          {
            key: `swap${index}_x`,
            label: `Tileset X of Tile ${index}`,
            description: "X coordinate of the starting tile in the tileset you will be swapping to.",
            type: "number",
            min: 0,
            width: "50%",
            conditions: [
              {
                key: "items",
                gte: index,
              },
            ],
            defaultValue: 0,
          },
          {
            key: `swap${index}_y`,
            label: `Tileset Y of Tile ${index}`,
            description: "Y coordinate of the starting tile in the tileset you will be swapping to.",
            type: "number",
            min: 0,
            width: "50%",
            conditions: [
              {
                key: "items",
                gte: index,
              },
            ],
            defaultValue: 0,
          },

          {
            type: "break",
            conditions: [
              {
                key: "items",
                gte: index,
              },
            ],
          },



        );
        return arr;
      }, []),


    
    {
      key: "waitFrames",
      label: "Frames to wait between swaps",
      description: "The duration in frames until the next frame of animation is swapped.",
      type: "number",
      min: 0,
      width: "50%",
      defaultValue: 0,
    },
    {
      key: "tilemapName",
      label: "Tilemap Name",
      // TODO: Check case sensitivity
      description: "The tilemap name is the name of the file of the files you want to swap in lowercase without file extensions.",
      type: "text",
      defaultValue: "",
      flexBasis: "100%",
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

  ]
);

const compile = (input, helpers) => {
    const {
        appendRaw,
        wait,
        warnings,
    } = helpers;


    const loopAmount = input.tileAmount === "single" ? 1 : 4;
    const hasWait = input.waitFrames != 0
    const frames = input.frames;
    const items = input.items;
    const tilemap = input.tilemapName;

    
    for (let i = 0; i < frames; i++) {

      for(let j = 1; j <= items; j++){

          const x = input[`tile${j}_x`];
          const y = input[`tile${j}_y`];
          const swapX = input[`swap${j}_x`];
          const swapY = input[`swap${j}_y`];

          let currentIndex = swapY * input.tileLength + swapX + (i * loopAmount);
          const currentX = [x, x + 1, x, x + 1];
          const currentY = [y, y, y + 1, y + 1];
            
          for(let k = 0; k < loopAmount; k++){          
              appendRaw(`VM_PUSH_CONST ${currentIndex}`);
              appendRaw(`VM_REPLACE_TILE_XY ${currentX[k]}, ${currentY[k]}, ___bank_bg_${tilemap}_tileset, _bg_${tilemap}_tileset, .ARG0`);
              appendRaw(`VM_POP 1`);
              currentIndex++;
          }
      }

        
        if(hasWait) wait(input.waitFrames)
    }

};

module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
  };

