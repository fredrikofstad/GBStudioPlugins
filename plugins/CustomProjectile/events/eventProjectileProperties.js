const id = "FO_EVENT_PROJECTILE_PROPERTIES";
const name = "Projectile Properties";
const groups = ["Plugins"];


const fields = [

  {
    key: "lifetime",
    label: "Infinite Lifetime",
    type: "checkbox",
    defaultValue: false,
  },
  {
    key: "bounds",
    label: "No bounds",
    type: "checkbox",
    defaultValue: false,
  },

];

const compile = (input, helpers) => {
  const { 
    warnings,
    engineFieldSetToValue,
  } = helpers;
  
  if (!input.lifetime) {
    engineFieldSetToValue("projectile_no_lifetime");
  } else {
    engineFieldSetToValue("projectile_no_lifetime", 1);
  }

  if (!input.bounds) {
    engineFieldSetToValue("projectile_no_bounds");
  } else {
    engineFieldSetToValue("projectile_no_bounds", 1);
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
