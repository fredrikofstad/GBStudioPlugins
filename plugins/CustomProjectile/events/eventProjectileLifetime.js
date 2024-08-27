const id = "FO_EVENT_PROJECTILE_LIFETIME";
const name = "Set Projectile Lifetime";
const groups = ["Projectiles"];


const fields = [

  {
    key: "lifetime",
    label: "Infinite Lifetime",
    type: "checkbox",
    defaultValue: false,
  }

];

const compile = (input, helpers) => {
  const { 
    engineFieldSetToValue,
  } = helpers;
  
  if (!input.lifetime) {
    engineFieldSetToValue("projectile_no_lifetime");
  } else {
    engineFieldSetToValue("projectile_no_lifetime", 1);
  }

};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
};
