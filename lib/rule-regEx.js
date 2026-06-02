// regExRule.js

const StringRule = require("./stringRule.js");

class RegExRule extends StringRule {
  _pattern;
  _flags;

  constructor(key, pattern, flags) {
    super(key);

    if (!(pattern instanceof RegExp)) {
      throw new Error("RegExRule requires a RegExp pattern");
    }

    this._pattern = pattern;
    this._flags = flags;
  }

  // -------------------------
  // Configuration
  // -------------------------

  pattern(regex) {
    if (!(regex instanceof RegExp)) {
      throw new Error("pattern() expects a RegExp");
    }

    this._pattern = regex;
    return this;
  }

  flags(flags) {
    if (typeof flags !== "string") {
      throw new Error("flags() expects a string");
    }

    this._flags = flags;
    return this;
  }

  // -------------------------
  // Core Validation
  // -------------------------

  check(data = {}) {
    let value = super.check(data);

    if (value === undefined || value === null) {
      return value;
    }

    if (typeof value !== "string") {
      throw new Error(`"${this._key}" must be a string`);
    }

    // Build regex with flags if provided
    let regex = this._pattern;

    if (this._flags) {
      regex = new RegExp(this._pattern.source, this._flags);
    }

    if (!regex.test(value)) {
      throw new Error(`"${this._key}" does not match the required pattern`);
    }

    return value;
  }
}

module.exports = RegExRule;
