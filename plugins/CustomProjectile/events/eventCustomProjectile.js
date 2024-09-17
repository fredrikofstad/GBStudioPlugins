const id = "FO_EVENT_CUSTOM_PROJECTILE";
const groups = ["Projectiles"];
const name = "Custom Projectile";

// anchor?

const type = { 
  default: 0,
  arc: 1,
  boomerang: 2,
  sine: 3,
  orbit: 4,
  hookshot: 5,
  custom: 6
} 

// conditions:
const defaultView = {
  key: "tabs",
  in: ["default"],
};
const generalView = {
  key: "tabs",
  in: ["general"],
};
const arc = {
  key: "projectile",
  eq: type.arc
};
const boomerang = {
  key: "projectile",
  eq: type.boomerang
};
const sineWave = {
  key: "projectile",
  eq: type.sine
};
const orbit = {
  key: "projectile",
  eq: type.orbit
};
const hookshot = {
  key: "projectile",
  eq: type.hookshot
};
const custom = {
  key: "projectile",
  eq: type.custom
};

const bounce = {
  key: "collision",
  gte: type.boomerang
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
  {
    key: "gravity",
    label: "Gravity",
    type: "slider",
    defaultValue: 0,
    min: -15,
    max: 15,
    conditions: [generalView]
  },
  {
    key: "collision",
    label: "Collision Behaviour",
    type: "select",
    options: [
      [0, "No effect"],
      [1, "Remove Projectile"],
      [2, "Bounce"],
      [3, "Bounce (only floor)"],
    ],
    defaultValue: 0,
    conditions: [generalView,
    {
        key: "projectile",
        ne: type.hookshot
    }
    ]
  },
  {
    key: "bounce",
    label: "Bounce",
    type: "slider",
    defaultValue: 0,
    min: 0,
    max: 128,
    conditions: [generalView, bounce]
  },
  {
    key: "death",
    label: "Update Variables on removal",
    type: "checkbox",
    defaultValue: false,
    conditions: [generalView,
      {
        key: "projectile",
        ne: type.custom
      }
    ]
  },
  {
    key: "varX",
    label: "X Position of Projectile",
    type: "variable",
    defaultValue: "LAST_VARIABLE",
    conditions: [generalView, 
      {
        key: "death",
        eq: true
      }
  ],
  },
  {
    key: "varY",
    label: "Y Position of projectile",
    type: "variable",
    defaultValue: "LAST_VARIABLE",
    conditions: [generalView, 
      {
        key: "death",
        eq: true
      }
    ],
  },
  // PROJECTILES
  {
    key: "projectile",
    label: "Projectile Behavior",
    type: "select",
    options: [
      [type.default, "Default"],
      [type.arc, "Arc"],
      [type.boomerang, "Boomerang"],
      [type.sine, "Sine Wave"],
      [type.orbit, "Orbit"],
      [type.hookshot, "Hookshot"],
      [type.custom, "Custom"],
      //[6, "Homing"],
    ],
    defaultValue: type.default,
    conditions: [defaultView],
  },
  // arc
  {
    key: "arc_height",
    label: "Height",
    type: "slider",
    defaultValue: 50,
    min: 0,
    max: 100,
    conditions: [defaultView, arc]
  },
  {
    key: "gravity",
    label: "Gravity",
    type: "slider",
    defaultValue: 6,
    min: 0,
    max: 15,
    conditions: [defaultView, arc]
  },
  // boomerang
  {
    key: "distance",
    label: "Resistance",
    type: "slider",
    defaultValue: 2,
    min: 1,
    max: 10,
    conditions: [defaultView, boomerang]
  },
  // sine
  {
    key: "amplitude",
    label: "Amplitude",
    type: "slider",
    defaultValue: 30,
    min: 0,
    max: 127,
    conditions: [defaultView, sineWave]
  },
  {
    key: "frequency",
    label: "Frequency",
    type: "slider",
    defaultValue: 10,
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
    key: "actor",
    label: "Orbit Center",
    type: "actor",
    defaultValue: "$self$",
    conditions: [defaultView, orbit]
  },
  {
    key: "orbit_x_offset",
    label: "X Offset",
    type: "number",
    defaultValue: 0,
    min: -128,
    max: 127,
    width: "50%",
    conditions: [defaultView, orbit]
  },
  {
    key: "orbit_y_offset",
    label: "Y Offset",
    type: "number",
    defaultValue: 0,
    min: -128,
    max: 127,
    width: "50%",
    conditions: [defaultView, orbit]
  },
  {
    key: "orbit_amplitude",
    label: "Amplitude",
    type: "slider",
    defaultValue: 100,
    min: 0,
    max: 127,
    conditions: [defaultView, orbit]
  },
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
  {
    key: "launch",
    label: "Launch Projectiles",
    type: "checkbox",
    defaultValue: false,
    conditions: [defaultView, orbit],
  },
  // Hookshot
  {
    key: "hookshot_chain",
    label: "Hookshot Chain",
    type: "select",
    options: [
      [0, "Head"],
      [1, "First chain"],
      [2, "Second chain"],
      [3, "Third chain"],
    ],
    defaultValue: 0,
    conditions: [defaultView, hookshot]
  },
  {
    key: "collision",
    label: "Collision Behaviour",
    type: "select",
    options: [
      [0, "No effect"],
      [1, "Return"],
    ],
    defaultValue: 0,
    conditions: [defaultView,
    {
        key: "projectile",
        eq: type.hookshot
    }
    ]
  },
  // Custom
  {
    key: "customX",
    label: "Delta X of projectile",
    type: "variable",
    defaultValue: "LAST_VARIABLE",
    conditions: [defaultView, custom],
  },
  {
    key: "customY",
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
    getActorIndex,
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

  if (input.collision == 0) {
    engineFieldSetToValue("projectile_collision");
    engineFieldSetToValue("projectile_bounce");
  } else {
    engineFieldSetToValue("projectile_collision", input.collision);
    if(input.collision >= 2){
      engineFieldSetToValue("projectile_bounce", input.bounce);
    }
  }

  if (!input.gravity) {
    engineFieldSetToValue("projectile_gravity");
  } else {
    engineFieldSetToValue("projectile_gravity", input.gravity);
  }

  if (!input.death) {
    engineFieldSetToValue("projectile_flags");
  } else {
    engineFieldSetToValue("projectile_flags", 1);
    engineFieldSetToValue("projectile_delta_x", input.varX);
    engineFieldSetToValue("projectile_delta_y", input.varY);
  }

  switch (input.projectile) {
    case type.arc:
      engineFieldSetToValue("projectile_distance2", input.arc_height);
      engineFieldSetToValue("projectile_gravity", input.gravity);
      break;
    case type.boomerang:
      engineFieldSetToValue("projectile_distance", input.distance);
      break;
    case type.sine:
      engineFieldSetToValue("projectile_amplitude", input.amplitude);
      engineFieldSetToValue("projectile_frequency", input.frequency)
      engineFieldSetToValue("projectile_phase", input.phase);
      break;
    case type.orbit:
      engineFieldSetToValue("projectile_amplitude", input.orbit_amplitude);
      engineFieldSetToValue("projectile_frequency", input.orbit_frequency)
      engineFieldSetToValue("projectile_phase", input.orbit_phase);
      engineFieldSetToValue("projectile_distance", input.orbit_x_offset);
      engineFieldSetToValue("projectile_distance2", input.orbit_y_offset);
      engineFieldSetToValue("projectile_actor", getActorIndex(input.actor));
      engineFieldSetToValue("projectile_launch_orbit", input.launch ? 1 : 0);
      break;
    case type.hookshot:
      engineFieldSetToValue("projectile_distance", input.hookshot_chain);
      break;

    case type.custom:
      engineFieldSetToValue("projectile_delta_x", input.customX);
      engineFieldSetToValue("projectile_delta_y", input.customY);
      break;
    
  }


};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
};
