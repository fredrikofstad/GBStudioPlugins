const id = "FO_EVENT_RESET_CUTSCANLINE";
const groups = ["Tiles"];
const name = "UI Reset Cut Scanline";

const fields = [].concat(
  [
    {
      label: "Resets scanline if hud is rendered on top",
    },
    {
      key: "reset",
      label: "Reset Overlay too?",
      type: "checkbox",
    },

  ]);

const compile = (input, helpers) => {
    const {
        appendRaw,
    } = helpers;

    // Hides overlay and resets scanline
    if (input.reset) {
      appendRaw(`VM_OVERLAY_HIDE`);
    }
    appendRaw(`VM_SET_CONST_UINT8 _overlay_cut_scanline, 150`);

};

  module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
  };