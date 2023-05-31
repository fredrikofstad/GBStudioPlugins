const id = "FO_EVENT_HUD_OVERLAY";
const groups = ["UI"];
const name = "UI Hud Overlay";


const fields = [].concat(
    [
        {
            key: "position",
            label: "Position of Hud",
            type: "select",
            width: "50%",
            options: [
                ["top", "Top"],
                ["bottom", "Bottom"],
            ],
            defaultValue: "bottom",
         },

         {
            key: "height",
            label: "Height of Overlay in tiles",
            type: "number",
            min: 1,
            width: "50%",
            defaultValue: 1,
         },

         {
            key: "hud_x",
            label: "start x tile of HUD",
            type: "number",
            min: 1,
            width: "50%",
            defaultValue: 1,
         },

         {
            key: "hud_y",
            label: "start y tile of HUD",
            type: "number",
            min: 1,
            width: "50%",
            defaultValue: 1,
         },

    ]);



  const compile = (input, helpers) => {
    const {
        appendRaw,
    } = helpers;

    positionTop = input.position === "top";
    height = input.height;
    x = input.hud_x;
    y = input.hud_y;
    overlayY = positionTop ? 0 : 18 - height;

    if (positionTop) {
        appendRaw(
        `; Set overlay scanline cut
        VM_SET_CONST_UINT8 _overlay_cut_scanline, ${height * 8 - 1}
        `);
    }

    appendRaw(
        `VM_OVERLAY_SET_SUBMAP 0, 0, 20, ${height}, ${x}, ${y}`
    );

    appendRaw(
        `; Move Overlay
        VM_OVERLAY_SETPOS 0, ${overlayY}
        VM_OVERLAY_WAIT         .UI_MODAL, .UI_WAIT_WINDOW`
    );

    

};



  module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
  };