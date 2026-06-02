// floatRule.js

const NumberRule = require("./numberRule.js");

class FloatRule extends NumberRule {
  _allowInteger = false;

  // -------------------------
  // Configuration
  // -------------------------

  allowInteger(value = true) {
    this._allowInteger = value;
    return this;
  }

  // -------------------------
  // Core Validation
  // -------------------------

  check(data = {}) {
    const value = super.check(data);

    if (value === undefined || value === null) {
      return value;
    }

    // Enforce float (non-integer)
    if (!this._allowInteger && Number.isInteger(value)) {
      throw new Error(`"${this._key}" must be a floating point number`);
    }

    return value;
  }
}

module.exports = FloatRule;
