const id = "FO_EVENT_FOLLOW_PLAYER";
const groups = ["Plugins"];
const name = "Follow Player"

const fields = [

  {
    key: "follow",
    label: "Follow player?",
    type: "select",
    options: [
      [0, "Don't Follow"],
      [1, "Follow"],
    ],
    defaultValue: 0,
  },

  {
    key: "default",
    label: "Default to Actor 1",
    type: "checkbox",
    conditions: [
      {
        key: "follow",
        eq: 1,
      },
    ],
  },

  {
    key: "actorID",
    label: "Actor",
    type: "actor",
    defaultValue: "$self$",
    conditions: [
      {
        key: "follow",
        eq: 1,
      },
    ],
  },


];

const compile = (input, helpers) => {
  const { 
    warnings,
    engineFieldSetToValue,
    getActorIndex,
    actorSetActive, 
    actorSetCollisions
  } = helpers;

  if (!input.follow) {
    engineFieldSetToValue("follow");
  } else {
    actorSetActive(input.actorID);
    actorSetCollisions(false);
    engineFieldSetToValue("follow", input.follow);
    if (input.default) {
      engineFieldSetToValue("partner", 1);
    } else {
      engineFieldSetToValue("partner", getActorIndex(input.actorID));
    }
  }

};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
};