const id = "FO_EVENT_SWAP_TILES";
const groups = ["FO"];
const name = "Swap Tiles";

const fields = [
    {
      key: "x",
      label: "X",
      type: "number",
      min: 0,
      width: "50%",
      defaultValue: 0,
    },
    {
      key: "y",
      label: "Y",
      type: "number",
      min: 0,
      width: "50%",
      defaultValue: 0,
    },
    {
      key: "tileAmount",
      label: "Amount of Tiles",
      type: "select",
      width: "50%",
      options: [
      ["single", "1x1"],
      ["four", "2x2"]
      ],
      defaultValue: "single",
    },
    {
      key: "frames",
      label: "Frame amount",
      type: "number",
      min: 1,
      width: "50%",
      defaultValue: 1,
    },
    {
      key: "waitFrames",
      label: "Frames to wait between swaps",
      type: "number",
      min: 0,
      width: "50%",
      defaultValue: 0,
    },
    {
      key: "tilemapName",
      label: "Tilemap Name",
      type: "text",
      defaultValue: "",
      flexBasis: "100%",
    },
    {
      key: "tileMapIndex",
      label: "Index in tilemap",
      type: "number",
      min: 0,
      width: "50%",
      defaultValue: 0,
    },

  ];

const compile = (input, helpers) => {
    const {
        appendRaw,
        _addComment,
        wait,
        warnings,
    } = helpers;

    let currentIndex = input.tileMapIndex;
    const currentX = [input.x, input.x + 1, input.x, input.x + 1];
    const currentY = [input.y, input.y, input.y + 1, input.y + 1];
    const loopAmount = input.tileAmount === "single" ? 1 : 4;
    const hasWait = input.waitFrames != 0
    
    for (let i = 0; i < input.frames; i++) {

        for(let j = 0; j < loopAmount; j++){
            _addComment("Swapping Tiles");
            appendRaw(`VM_PUSH_CONST ${currentIndex}`);
            appendRaw(`VM_REPLACE_TILE_XY ${currentX[j]}, ${currentY[j]}, ___bank_bg_${input.tilemapName}_tileset, _bg_${input.tilemapName}_tileset, .ARG0`);
            appendRaw(`VM_POP 1`);
            currentIndex++;
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

