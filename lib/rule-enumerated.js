// rule-enumerated.js

const AbstractRule = require("./abstractRule");

class EnumeratedRule extends AbstractRule {
  _values = [];
  _message;

  constructor(key, values = []) {
    super(key);

    if (!Array.isArray(values) || values.length === 0) {
      throw new Error("EnumeratedRule requires a non-empty array of values");
    }

    this.values(values);
  }

  // -------------------------
  // Configuration
  // -------------------------

  values(values) {
    if (!Array.isArray(values) || values.length === 0) {
      throw new Error("values() expects a non-empty array");
    }

    // Ensure all values are strings
    for (const v of values) {
      if (typeof v !== "string") {
        throw new Error("All enumerated values must be strings");
      }
    }

    this._values = values;
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
    let value = super.check(data);

    if (value === undefined || value === null) {
      return value;
    }

    if (typeof value !== "string") {
      throw new Error(`"${this._key}" must be a string`);
    }

    const input = value.trim().toLowerCase();

    // Find match (case-insensitive)
    const match = this._values.find(v => v.toLowerCase() === input);

    if (!match) {
      throw new Error(
        this._message ||
          `"${this._key}" must be one of [${this._values.join(", ")}]`
      );
    }

    // Return canonical value from enum
    return match;
  }
}

module.exports = EnumeratedRule;
