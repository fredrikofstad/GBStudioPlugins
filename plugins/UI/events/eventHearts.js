const id = "FO_EVENT_UI_HEARTS";
const groups = ["Plugins"];
const name = "UI Hearts";

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
      key: `currentVar`,
      label: `Current health variable`,
      description: "Variable of number to show",
      type: "variable",
      defaultValue: "LAST_VARIABLE",
      min: 0,
      width: "50%",
    },
    {
      key: `maxVar`,
      label: `Max Health Variable`,
      description: "Variable of number to show",
      type: "variable",
      defaultValue: "LAST_VARIABLE",
      min: 0,
      width: "50%",
    },

    {
      key: `heartsPerLine`,
      label: "max hearts per row",
      description: "",
      type: "number",
      width: "50%",
      min: 1,
      defaultValue: 1,
    },
    {
      key: `division`,
      label: "division",
      description: "",
      type: "number",
      width: "50%",
      defaultValue: 4,
    },
]);

const compile = (input, helpers) => {
    const {
        appendRaw,
        warnings,
        variableSetToValue,
        getVariableAlias,
    } = helpers;

    const tilemap = input.tilemapName.toLowerCase();
    const length = input.tileLength;
    const heartsPerLine = input[`heartsPerLine`];

    let currentX = input[`tile_x`];
    let currentY = input[`tile_y`];

    const swapX = input[`swap_x`];
    const swapY = input[`swap_y`];
    const current = getVariableAlias(input[`currentVar`]);
    const max = getVariableAlias(input[`maxVar`]);
    const division = input["division"];
    const tileIndex = swapY * length + swapX;
    const maxHeart = tileIndex + division;

    variableSetToValue("T0", 0);
    variableSetToValue("T1", 0);


    const getIndex = `
    VM_PUSH_CONST ${currentX}
    VM_PUSH_CONST ${currentY}
    VM_GET_TILE_XY VAR_TEMP_1, .ARG1, .ARG0
    VM_POP 2
    `;

    const calculateFull = `
    ; how many full hearts
    VM_RPN
            .R_REF ${current}
            .R_INT8 ${division}
            .R_OPERATOR .DIV
            .R_STOP
    VM_SET    VAR_TEMP_0, .ARG0
    VM_POP 1
`;

    const loop = `
    ; Variable Set To Value
    VM_PUSH_CONST 0

cond$:
    ; If Variable .LT Variable
    VM_IF         .LT, .ARG0, VAR_TEMP_0, iter$, 0
    VM_JUMP       break$
iter$:
    ;;;; Replace Tile
    VM_PUSH_CONST ${maxHeart}
    VM_REPLACE_TILE VAR_TEMP_1, ___bank_bg_${tilemap}_tileset, _bg_${tilemap}_tileset, .ARG0, 1
    VM_POP 1

    VM_IF_CONST         .EQ, .ARG0, ${heartsPerLine-1}, addline$, 0
    VM_JUMP       addone$
addline$:
    VM_PUSH_CONST ${currentX}
    VM_PUSH_CONST ${currentY+1}
    VM_GET_TILE_XY VAR_TEMP_1, .ARG1, .ARG0
    VM_POP 2
    VM_JUMP       increment$

addone$:
    VM_RPN
        .R_REF      VAR_TEMP_1
        .R_INT8    1
        .R_OPERATOR .ADD
        .R_STOP
    VM_SET    VAR_TEMP_1, .ARG0
    VM_POP 1
increment$:
    ; Variables .ADD Value
    VM_RPN
        .R_REF      .ARG0
        .R_INT8    1
        .R_OPERATOR .ADD
        .R_STOP
    VM_SET    .ARG1, .ARG0
    VM_POP 1

    VM_JUMP                 cond$
break$:
`;


    const calculateRemain = `
    ; how many non full hearts 
    VM_RPN
            .R_REF ${current}
            .R_INT8 ${division}
            .R_OPERATOR .MOD
            .R_INT8    ${tileIndex}
            .R_OPERATOR .ADD
            .R_STOP
    VM_IF_CONST         .EQ, .ARG0, ${tileIndex}, skip$, 0
    VM_REPLACE_TILE VAR_TEMP_1, ___bank_bg_${tilemap}_tileset, _bg_${tilemap}_tileset, .ARG0, 1
    VM_RPN
        .R_REF      VAR_TEMP_1
        .R_INT8    1
        .R_OPERATOR .ADD
        .R_STOP
    VM_SET    VAR_TEMP_1, .ARG0
    VM_POP 1
skip$:
    VM_POP 1
    `;

    appendRaw(getIndex);
    appendRaw(calculateFull);
    appendRaw(loop);
    appendRaw(calculateRemain)

};



module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
  };

