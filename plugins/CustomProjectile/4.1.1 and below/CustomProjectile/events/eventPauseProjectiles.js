// Based on NukeOTron's pause projectile plugin for locked scripts

const id = "FO_EVENT_PAUSE_PROJECTILES";
const name = "Pause Projectiles";
const groups = ["Projectiles"];


const fields = [

  {
    key: "pause",
    label: "Pause All Projectiles",
    type: "select",
    options: [
        [0, "Off"],
        [1, "Pause All Projectiles"],
        [2, "Pause on Locked Script"],
      ],
      defaultValue: 0,
  },

];

const compile = (input, helpers) => {
  const { 
    engineFieldSetToValue,
  } = helpers;

    engineFieldSetToValue("projectile_pause", input.pause);

};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
};
