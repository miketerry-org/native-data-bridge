// timeRule.js

const RegExRule = require("./regExRule");

class TimeRule extends RegExRule {
  _allowMilliseconds = true;

  constructor(key) {
    // Default: HH:mm:ss(.SSS optional)
    const pattern = /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d(\.\d{1,3})?$/;

    super(key, pattern);
  }

  // -------------------------
  // Configuration
  // -------------------------

  allowMilliseconds(value = true) {
    this._allowMilliseconds = value;
    this._updatePattern();
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

    value = value.trim();

    if (!this._pattern.test(value)) {
      throw new Error(
        `"${this._key}" must be a valid Postgres TIME value (HH:mm:ss)`
      );
    }

    return value;
  }

  // -------------------------
  // Helpers
  // -------------------------

  _updatePattern() {
    if (this._allowMilliseconds) {
      this._pattern = /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d(\.\d{1,3})?$/;
    } else {
      this._pattern = /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;
    }
  }
}

module.exports = TimeRule;
