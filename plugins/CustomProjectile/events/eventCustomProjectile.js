
const id = "FO_EVENT_CUSTOM_PROJECTILE";
const groups = ["Plugins"];
const name = "Custom Projectile"

// conditions:
const sineWave = {
  key: "projectile",
  eq: 4
};
const boomerang = {
  key: "projectile",
  eq: 3
};

const fields = [

  {
    key: "projectile",
    label: "Projectile Behavior",
    type: "select",
    options: [
      [0, "Default"],
      [1, "Gravity"],
      [2, "Arc"],
      [3, "Boomerang"],
      [4, "Sine Wave"],
    ],
    defaultValue: 0,
  },
  {
    key: "lifetime",
    label: "Live forever?",
    type: "checkbox",
    defaultValue: false,
  },
  // boomerang
  {
    key: "distance",
    label: "Distance",
    type: "slider",
    defaultValue: 100,
    min: 0,
    max: 30,
    conditions: [boomerang]
  },
  {
    key: "amplitude",
    label: "Amplitude",
    type: "slider",
    defaultValue: 100,
    min: 0,
    max: 128,
    conditions: [sineWave]
  },
  // sine
  {
    key: "frequency",
    label: "Frequency",
    type: "slider",
    defaultValue: 20,
    min: 1,
    max: 100,
    conditions: [sineWave]
  },
  {
    key: "phase",
    label: "Phase",
    type: "slider",
    defaultValue: 64,
    min: 0,
    max: 255,
    conditions: [sineWave]
  },


];

const compile = (input, helpers) => {
  const { 
    warnings,
    engineFieldSetToValue,
  } = helpers;
  

  if (!input.projectile) {
    engineFieldSetToValue("projectile_type");
  } else {
    engineFieldSetToValue("projectile_type", input.projectile);
  }

  if (!input.lifetime) {
    engineFieldSetToValue("projectile_no_lifetime");
  } else {
    engineFieldSetToValue("projectile_no_lifetime", 1);
  }

  switch (input.projectile) {
    case 3:
      engineFieldSetToValue("projectile_distance", input.distance);
      break;
    case 4:
      engineFieldSetToValue("projectile_amplitude", input.amplitude);
      engineFieldSetToValue("projectile_frequency", input.frequency)
      engineFieldSetToValue("projectile_phase", input.phase);
      break;
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