const id = "FO_EVENT_HIDE_ALL_PROJECTILES";
const name = "Hide All Projectiles";
const groups = ["Projectiles"];


const fields = [

  {
    label: "Hide All Projectiles",
  }

];

const compile = (input, helpers) => {
  const { 
    engineFieldSetToValue,
  } = helpers;

  engineFieldSetToValue("projectile_hide", 1);

};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
};
