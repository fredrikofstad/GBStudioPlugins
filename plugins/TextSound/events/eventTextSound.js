const id = "FO_EVENT_TEXT_SOUND";
const groups = ["Plugins"];
const name = "Set Text Sound";

const fields = [].concat(
  [
    {
      label: "Set Sound Effect for Text",
    },
    {
        key: "type",
        type: "soundEffect",
        label: "Sound Effect",
        defaultValue: "beep",
        flexBasis: "60%",
      },
      {
        key: "priority",
        label: "Priority",
        type: "priority",
        options: [
          ["low", "Low"],
          ["medium", "Medium"],
          ["high", "High"],
        ],
        defaultValue: "medium",
        flexBasis: "15%",
      },
      {
        key: "pitch",
        type: "number",
        label: "Pitch",
        conditions: [
          {
            key: "type",
            eq: "beep",
          },
        ],
        min: 1,
        max: 8,
        step: 1,
        defaultValue: 4,
      },
      {
        key: "frequency",
        type: "number",
        label: "Frequency",
        conditions: [
          {
            key: "type",
            eq: "tone",
          },
        ],
        min: 0,
        max: 20000,
        step: 1,
        defaultValue: 200,
      },
      {
        key: "duration",
        type: "number",
        label: "Duration",
        unitsField: "units",
        unitsDefault: "time",
        conditions: [
          {
            key: "type",
            in: ["beep", "crash", "tone"],
          },
        ],
        min: 0,
        max: 4.25,
        step: 0.01,
        defaultValue: 0.5,
      },
      {
        key: "effect",
        type: "number",
        label: "Effect Index",
        min: 0,
        max: 60,
        defaultValue: 0,
        conditions: [
          {
            key: "type",
            soundType: "fxhammer",
          },
        ],
      },
    ]);


const compile = (input, helpers) => {
    const {
        appendRaw,
    } = helpers;

    let priority = input.priority || "medium";
    let seconds = typeof input.duration === "number" ? input.duration : 0.5;
    let frames = seconds * 60;

    if (input.type === "beep" || !input.type) {
        const pitch = typeof input.pitch === "number" ? input.pitch : 4;
        soundPlayBeep(9 - pitch, frames, priority);
    } else if (input.type === "tone") {
        const freq = typeof input.frequency === "number" ? input.frequency : 200;
        let period = (2048 - 131072 / freq + 0.5) | 0;
        if (period >= 2048) {
        period = 2047;
        }
        if (period < 0) {
        period = 0;
        }
        soundStartTone(period, frames, priority);
    } else if (input.type === "crash") {
        soundPlayCrash(frames, priority);
    } else {
        soundPlay(input.type, priority, input.effect);
    }


};

  module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
  };