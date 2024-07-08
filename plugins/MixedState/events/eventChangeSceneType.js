const id = "FO_EVENT_CHANGE_STATE";
const groups = ["Plugins"];
const name = "Change Scene Type"

const fields = [

  {
    key: "change",
    label: "Change Scene Type",
    type: "select",
    options: [
      [0, "Topdown"],
      [1, "Platformer"],
      [2, "Adventure"],
      [3, "Shmup"],
      [4, "Point and Click"],
      [5, "Logo"]
    ],
    defaultValue: 0,
  },

];

const compile = (input, helpers) => {
  const { 
    warnings,
    engineFieldSetToValue,
  } = helpers;
  
  engineFieldSetToValue("CURRENT_STATE", input.change);

};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
};