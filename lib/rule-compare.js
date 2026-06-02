// compareRule.js

const AbstractRule = require("./abstractRule");

class CompareRule extends AbstractRule {
  _compareKey;
  _strict = true;
  _message;

  constructor(key, compareKey) {
    super(key);

    if (!compareKey) {
      throw new Error("CompareRule requires a compareKey");
    }

    this._compareKey = compareKey;
  }

  // -------------------------
  // Configuration
  // -------------------------

  compareKey(key) {
    this._compareKey = key;
    return this;
  }

  strict(value = true) {
    this._strict = value;
    return this;
  }

  message(msg) {
    this._message = msg;
    return this;
  }

  // -------------------------
  // Core Validation
  // -------------------------

  check(data = {}) {
    const value = super.check(data);

    const compareValue = data[this._compareKey];

    // Handle undefined cases
    if (value === undefined || compareValue === undefined) {
      if (this._required) {
        throw new Error(
          this._message ||
            `"${this._key}" and "${this._compareKey}" are required`
        );
      }

      return value;
    }

    // Comparison
    const matches = this._strict
      ? value === compareValue
      : value == compareValue;

    if (!matches) {
      throw new Error(
        this._message || `"${this._key}" must match "${this._compareKey}"`
      );
    }

    return value;
  }
}

module.exports = CompareRule;
