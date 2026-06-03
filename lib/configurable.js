// configurable.js:

"use strict";

const Abstract = require("./abstract");

class Configurable extends Abstract {
  _config;

  constructor(config = {}, rulesSet = undefined) {
    if (ruleSet) {
      const results = rulesett.check(config);
      if (results.errors.length > 0) {
        throw new Error(results.errors.join(", "));
      }
    }
    this._config = { ...config };
  }

  get config() {
    return this._config;
  }

  get config() {
    return this._config;
  }
}

module.exports = Configurable;
