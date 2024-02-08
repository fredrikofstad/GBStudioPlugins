
const id = "FO_EVENT_PROJECTILE_PLUS";
const groups = ["Plugins"];
const name = "Projectile Plus"

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

  {
    type: "group",
    fields: [
      {
        key: "spriteSheetId",
        type: "sprite",
        label: "Sprite Sheet",
        defaultValue: "LAST_SPRITE",
      },
      {
        key: "spriteStateId",
        type: "animationstate",
        label: "Animation State",
        defaultValue: "",
      },
    ],
  },
  {
    key: "actorId",
    type: "actor",
    label: "Source",
    defaultValue: "$self$",
  },
  {
    type: "group",
    fields: [
      {
        key: "x",
        label: "Offset X",
        type: "number",
        min: -256,
        max: 256,
        width: "50%",
        defaultValue: 0,
      },
      {
        key: "y",
        label: "Offset Y",
        type: "number",
        min: -256,
        max: 256,
        width: "50%",
        defaultValue: 0,
      },
    ],
  },
  {
    type: "group",
    width: "50%",
    fields: [
      {
        key: "otherActorId",
        label: "Direction",
        type: "actor",
        defaultValue: "$self$",
        conditions: [
          {
            key: "directionType",
            eq: "actor",
          },
        ],
      },
      {
        key: "direction",
        label: "Direction",
        type: "direction",
        defaultValue: "right",
        conditions: [
          {
            key: "directionType",
            eq: "direction",
          },
        ],
      },
      {
        key: "angle",
        label: "Angle",
        type: "number",
        defaultValue: 0,
        conditions: [
          {
            key: "directionType",
            eq: "angle",
          },
        ],
      },
      {
        key: "angleVariable",
        label: "Angle",
        type: "variable",
        defaultValue: "LAST_VARIABLE",
        conditions: [
          {
            key: "directionType",
            eq: "anglevar",
          },
        ],
      },
      {
        key: "directionType",
        type: "selectbutton",
        options: [
          ["direction", "Fixed Direction"],
          ["actor", "Actor Direction"],
          ["angle", "Angle"],
          ["anglevar", "Angle Variable"],
        ],
        inline: true,
        defaultValue: "direction",
      },
    ],
  },
  {
    key: "initialOffset",
    label: "Direction Offset",
    type: "number",
    min: 0,
    max: 256,
    width: "50%",
    defaultValue: 0,
  },
  {
    type: "group",
    fields: [
      {
        key: "speed",
        label: "Speed",
        type: "moveSpeed",
        allowNone: true,
        defaultValue: 2,
        width: "50%",
      },
      {
        key: "animSpeed",
        label: "Animation Speed",
        type: "animSpeed",
        defaultValue: 15,
        width: "50%",
      },
    ],
  },
  {
    key: "lifeTime",
    label: "Lifetime",
    type: "number",
    min: 0,
    max: 4,
    step: 0.1,
    width: "50%",
    defaultValue: 1,
  },
  {
    type: "group",
    fields: [
      {
        key: "loopAnim",
        label: "Loop Animation",
        type: "checkbox",
        alignCheckbox: true,
        defaultValue: true,
      },
      {
        key: "destroyOnHit",
        label: "Destroy On Hit",
        type: "checkbox",
        alignCheckbox: true,
        defaultValue: true,
      },
    ],
  },
  {
    type: "group",
    fields: [
      {
        key: "collisionGroup",
        label: "Collision Group",
        type: "collisionMask",
        width: "50%",
        includePlayer: false,
        defaultValue: "3",
      },
      {
        key: "collisionMask",
        label: "Collide With",
        type: "collisionMask",
        width: "50%",
        includePlayer: true,
        defaultValue: ["1"],
      },
    ],
  },


];

const compile = (input, helpers) => {
  const { 
    getProjectileIndex,
    launchProjectileInDirection,
    launchProjectileInAngle,
    launchProjectileInSourceActorDirection,
    launchProjectileInActorDirection,
    launchProjectileInAngleVariable,
    actorSetActive,
    warnings,
    engineFieldSetToValue
  } = helpers;
  

  actorSetActive(input.actorId);

  const projectileIndex = getProjectileIndex(
    input.spriteSheetId,
    input.spriteStateId,
    input.speed,
    input.animSpeed,
    input.lifeTime,
    input.initialOffset,
    input.collisionGroup,
    input.collisionMask
  );


  if (projectileIndex < 0) {
    warnings(`${projectileIndex} x: ${input.x} y: ${input.y} dir: ${input.direction} doh: ${input.destroyOnHit} loop: ${input.loopAnim}`);
    warnings(`RETURNED`)
    return;
  }

  if (!input.projectile_type) {
    engineFieldSetToValue("projectile_type");
  } else {
    engineFieldSetToValue("projectile_type", input.projectile_type);
  }

  warnings(`projectile type: ${input.projectile_type}`)


  if (input.directionType === "direction") {
    warnings(`${projectileIndex} x: ${input.x} y: ${input.y} dir: ${input.direction} doh: ${input.destroyOnHit} loop: ${input.loopAnim}`);
    launchProjectileInDirection(
      projectileIndex,
      input.x,
      input.y,
      input.direction,
      input.destroyOnHit,
      input.loopAnim
    );
  } else if (input.directionType === "angle") {
    launchProjectileInAngle(
      projectileIndex,
      input.x,
      input.y,
      input.angle,
      input.destroyOnHit,
      input.loopAnim
    );
  } else if (input.directionType === "anglevar") {
    launchProjectileInAngleVariable(
      projectileIndex,
      input.x,
      input.y,
      input.angleVariable,
      input.destroyOnHit,
      input.loopAnim
    );
  } else if (input.directionType === "actor") {
    if (input.actorId === input.otherActorId) {
      launchProjectileInSourceActorDirection(
        projectileIndex,
        input.x,
        input.y,
        input.destroyOnHit,
        input.loopAnim
      );
    } else {
      launchProjectileInActorDirection(
        projectileIndex,
        input.x,
        input.y,
        input.otherActorId,
        input.destroyOnHit,
        input.loopAnim
      );
    }
  }


  engineFieldSetToValue("projectile_type", 0);


};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
  waitUntilAfterInitFade: true,
};