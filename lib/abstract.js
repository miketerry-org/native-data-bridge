// abstract.js:

"use strict";

// load all necessary modules
const { TurboError } = require("./errorClasses.js");

class Abstract {
  constructor() {}

  get className() {
    return this.constructor.name;
  }

  notImplemented(methodName) {
    this.throwError(`Not Implemented! (${className}.${methodName}`);
  }

  throwError(message, methodName = undefined) {
    if (methodName) {
      message = `${message} (${this.className}.${methodName})`;
    }
    throw new TurboError(message);
  }
}

module.exports = Abstract;
