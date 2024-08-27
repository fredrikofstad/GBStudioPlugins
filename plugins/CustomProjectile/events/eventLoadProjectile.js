const id = "FO_EVENT_LOAD_PROJECTILE";
const groups = ["Projectiles"];
const name = "Load Projectile";

const fields = [
    {
		key: "spriteSheetId",
        type: "sprite",
        label: "Sprite Sheet",
        defaultValue: "LAST_SPRITE",
        },
    {
        key: "source",
        label: "Projectile Source",
        type: "select",
        options: [
          [0, "From Another Scene"],
          [1, "From File"],
        ],
        defaultValue: 0,
    },
    {
		key: "fileName",
        type: "text",
        label: "Scene Name",
        conditions: 
        [{
            key: "source",
            eq: 1
        }]
    },
    {
        key: "scene",
        label: "Scene",
        type: "scene",
        flexBasis: "100%",
        defaultValue: "LAST_SCENE",
        conditions: 
        [{
            key: "source",
            ne: 1
        }]
    },
    {
		key: "slot",
        type: "number",
        label: "Projectile Slot",
        defaultValue: 0,
        type: "select",
        options: [
          [0, "0"],
          [1, "1"],
          [2, "2"],
          [3, "3"],
          [4, "4"],
        ],
    },

];

const compile = (input, helpers) => {
    const { 
        appendRaw,
        scenes,
        warnings
    } = helpers;

    let sceneName;

    if(input.source === 0){
        sceneName = scenes.find((s) => s.id === input.scene).symbol;
    } else {
        sceneName = input.fileName;
        if (input.tilemap === undefined) warnings("Did you remember to write the filename of the projectile?");
    }
    warnings(sceneName);
    
    appendRaw(`VM_PROJECTILE_LOAD_TYPE ${input.slot}, ___bank_${sceneName}_projectiles, _${sceneName}_projectiles`);

};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
};