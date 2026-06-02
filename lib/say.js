// index.js:

"use strict";

const say = require("say");

let _counter = 0;

function sayOnce(text) {
  if (_counter === 0) {
    say.speak(text);
  }
  _counter++;
}

process.on("exit", code => {
  if (code === 0) {
    sayOnce("?successful Run");
  } else if (code > 0) {
    sayOnce(`Exit code is ${code}`);
  }
});

process.on("uncaughtException", err => {
  console.log("Mike", err);
  sayOnce(err.message);
});

module.exports = sayOnce;
