const id = "FO_EVENT_SET_HOOKSHOT";
const name = "Set Hookshot State";
const groups = ["Projectiles"];


const fields = [

  {
    key: "hookshot_state",
    label: "Set Hookshot State",
    type: "select",
    options: [
        [0, "Firing"],
        [1, "Returning"],
        [2, "Pull Player"],
        [3, "Pull Actor"],
        [5, "Remove"],
      ],
      defaultValue: 0,
  },
  {
    key: "actor",
    label: "Actor to pull",
    type: "actor",
    defaultValue: "$self$",
    conditions: [
        {
          key: "hookshot_state",
          eq: 3
        }
      ]
  },

];

const compile = (input, helpers) => {
  const { 
    engineFieldSetToValue,
    getActorIndex,
  } = helpers;

    engineFieldSetToValue("projectile_hookshot_state", input.hookshot_state);
    if(input.hookshot_state == 3){
        engineFieldSetToValue("projectile_actor", getActorIndex(input.actor));
    }

};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
};
