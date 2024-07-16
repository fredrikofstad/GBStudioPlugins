const id = "FO_EVENT_CUSTOM_PROJECTILE";
const groups = ["Plugins"];
const name = "Custom Projectile";

// conditions:
const defaultView = {
  key: "tabs",
  in: ["default"],
};
const generalView = {
  key: "tabs",
  in: ["general"],
};
const boomerang = {
  key: "projectile",
  eq: 3
};
const sineWave = {
  key: "projectile",
  eq: 4
};
const custom = {
  key: "projectile",
  eq: 5
};
const orbit = {
  key: "projectile",
  eq: 6
};

const fields = [

  {
    key: "tabs",
    type: "tabs",
    defaultValue: "default",
    values: {
      default: "Projectiles",
      general: "Properties",
    },
  },
  // GENERAL

  {
    key: "lifetime",
    label: "Infinite Lifetime",
    type: "checkbox",
    defaultValue: false,
    conditions: [generalView],
  },
  {
    key: "bounds",
    label: "No bounds",
    type: "checkbox",
    defaultValue: false,
    conditions: [generalView],
  },
  // PROJECTILES
  {
    key: "projectile",
    label: "Projectile Behavior",
    type: "select",
    options: [
      [0, "Default"],
      [1, "Arc"],
      [2, "Gravity"],
      [3, "Boomerang"],
      [4, "Sine Wave"],
      [6, "Orbit"],
      [5, "Custom"],
    ],
    defaultValue: 0,
    conditions: [defaultView],
  },
  // boomerang
  {
    key: "distance",
    label: "Distance",
    type: "slider",
    defaultValue: 100,
    min: 0,
    max: 30,
    conditions: [defaultView, boomerang]
  },
  {
    key: "amplitude",
    label: "Amplitude",
    type: "slider",
    defaultValue: 100,
    min: 0,
    max: 127,
    conditions: [defaultView, sineWave]
  },
  // sine
  {
    key: "frequency",
    label: "Frequency",
    type: "slider",
    defaultValue: 20,
    min: 1,
    max: 100,
    conditions: [defaultView, sineWave]
  },
  {
    key: "phase",
    label: "Phase",
    type: "slider",
    defaultValue: 64,
    min: 0,
    max: 255,
    conditions: [defaultView, sineWave]
  },
  // Orbit
  {
    key: "orbit_amplitude",
    label: "Amplitude",
    type: "slider",
    defaultValue: 100,
    min: 0,
    max: 127,
    conditions: [defaultView, orbit]
  },
  // sine
  {
    key: "orbit_frequency",
    label: "Frequency",
    type: "slider",
    defaultValue: 20,
    min: 1,
    max: 100,
    conditions: [defaultView, orbit]
  },
  {
    key: "orbit_phase",
    label: "Phase",
    type: "slider",
    defaultValue: 64,
    min: 0,
    max: 255,
    conditions: [defaultView, orbit]
  },
  // Custom
  {
    key: "varX",
    label: "Delta X of projectile",
    type: "variable",
    defaultValue: "LAST_VARIABLE",
    conditions: [defaultView, custom],
  },
  {
    key: "varY",
    label: "Delta Y of projectile",
    type: "variable",
    defaultValue: "LAST_VARIABLE",
    conditions: [defaultView, custom],
  },


];

const compile = (input, helpers) => {
  const { 
    warnings,
    engineFieldSetToValue,
    getVariableAlias,
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

  if (!input.bounds) {
    engineFieldSetToValue("projectile_no_bounds");
  } else {
    engineFieldSetToValue("projectile_no_bounds", 1);
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
    case 5:
      engineFieldSetToValue("projectile_delta_x", input.varX);
      engineFieldSetToValue("projectile_delta_y", input.varY);
      break;
    case 6:
      engineFieldSetToValue("projectile_amplitude", input.orbit_amplitude);
      engineFieldSetToValue("projectile_frequency", input.orbit_frequency)
      engineFieldSetToValue("projectile_phase", input.orbit_phase);
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
