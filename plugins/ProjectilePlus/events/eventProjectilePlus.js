
const id = "FO_EVENT_PROJECTILE_SWAP";
const groups = ["Plugins"];
const name = "Projectile Swap"

const fields = [

  {
    key: "projectile_type",
    label: "Projectile Type",
    type: "select",
    options: [
      [0, "Default"],
      [1, "Arc"],
      [2, "Gravity"],
      [3, "Boomerang"],
    ],
    defaultValue: 0,
  },


];

const compile = (input, helpers) => {
  const { 
    warnings,
    engineFieldSetToValue,
  } = helpers;
  

  if (!input.projectile_type) {
    engineFieldSetToValue("projectile_type");
  } else {
    engineFieldSetToValue("projectile_type", input.projectile_type);
  }

};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
  waitUntilAfterInitFade: true,
};