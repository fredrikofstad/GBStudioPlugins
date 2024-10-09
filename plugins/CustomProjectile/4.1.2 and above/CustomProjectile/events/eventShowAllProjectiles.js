const id = "FO_EVENT_SHOW_ALL_PROJECTILES";
const name = "Show All Projectiles";
const groups = ["Projectiles"];


const fields = [

  {
    label: "Show All Projectiles",
  }

];

const compile = (input, helpers) => {
  const { 
    engineFieldSetToValue,
  } = helpers;

  engineFieldSetToValue("projectile_hide", 0);

};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
};
