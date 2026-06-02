// integerRule.js

const NumberRule = require("./numberRule.js");

class IntegerRule extends NumberRule {
  constructor(key) {
    super(key);

    // Always enforce integer behavior
    this._integer = true;
  }

  // Prevent disabling integer mode
  float() {
    throw new Error(`"${this._key}" must remain an integer`);
  }

  // -------------------------
  // Core Validation
  // -------------------------

  check(data = {}) {
    const value = super.check(data);

    if (value === undefined || value === null) {
      return value;
    }

    // Redundant safety check (in case base class changes)
    if (!Number.isInteger(value)) {
      throw new Error(`"${this._key}" must be an integer`);
    }

    return value;
  }
}

module.exports = IntegerRule;
