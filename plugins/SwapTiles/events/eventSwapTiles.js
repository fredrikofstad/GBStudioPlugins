const id = "FO_EVENT_SWAP_TILES";
const groups = ["Plugins"];
const name = "Swap Tiles";

const MAX_TILES = 50;

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
      key: "tileMode",
      label: "Tile sheet mode",
      description: "Are your tiles ordered consequtively or as a 16x16 block",
      type: "select",
      width: "50%",
      options: [
      ["consecutive", "consecutive"],
      ["block", "16x16 block"]
      ],
      defaultValue: "consecutive",
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
            label: `Unique Tile ${index}'s X`,
            type: "number",
            defaultValue: 0,
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
            label: `Unique Tile ${index}'s Y`,
            type: "number",
            defaultValue: 0,
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
            type: "break",
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
            label: `Tileset X of Tile ${index}`,
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
            label: `Tileset Y of Tile ${index}`,
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
            type: "break",
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


    const loopAmount =  input.tileAmount === "single" ? 1 : 4;
    const isBlockMode = input.tileMode === "block";
    const hasWait = input.waitFrames != 0
    const frames = input.frames;
    const items = input.items;
    const tilemap = input.tilemapName.toLowerCase();
    const skipRow = input.tileLength;
    const skipAmount = isBlockMode ? 2 : loopAmount;

    for(let j = 1; j <= items; j++){ //used for block16 mode
      input[`skip${j}`] = 0;
    }  

    for (let i = 0; i < frames; i++) {

      for(let j = 1; j <= items; j++){

          const x = input[`tile${j}_x`];
          const y = input[`tile${j}_y`];
          const swapX = input[`swap${j}_x`];
          const swapY = input[`swap${j}_y`];

          let currentIndex = swapY * input.tileLength + swapX + (i * skipAmount) + input[`skip${j}`];
          const currentX = [x, x + 1, x, x + 1];
          const currentY = [y, y, y + 1, y + 1];
            
          for(let k = 0; k < loopAmount; k++) {
              appendRaw(`VM_PUSH_CONST ${currentIndex}`);
              appendRaw(`VM_REPLACE_TILE_XY ${currentX[k]}, ${currentY[k]}, ___bank_bg_${tilemap}_tileset, _bg_${tilemap}_tileset, .ARG0`);
              appendRaw(`VM_POP 1`);
              if(isBlockMode && k == 1){
                currentIndex = (swapY + 1) * input.tileLength + swapX + (i * skipAmount) + input[`skip${j}`];
              } else if(isBlockMode && k == 3 && ((currentIndex + 1) % input.tileLength == 0)){ // check if on the edge of tilemap
                input[`skip${j}`] += skipRow;
              } else {
                currentIndex++;
              }

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

