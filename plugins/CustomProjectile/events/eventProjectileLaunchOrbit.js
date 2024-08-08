const id = "FO_EVENT_PROJECTILE_LAUNCH_ORBIT";
const name = "Launch Orbiting Projectiles";
const groups = ["Plugins"];


const fields = [

  {
    key: "launch",
    label: "Launch Projectiles",
    type: "checkbox",
    defaultValue: false,
  },

];

const compile = (input, helpers) => {
  const { 
    engineFieldSetToValue,
  } = helpers;
  
  if (!input.launch) {
    engineFieldSetToValue("projectile_flags", 0);
  } else {
    engineFieldSetToValue("projectile_flags", 1);
  }
};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
};
