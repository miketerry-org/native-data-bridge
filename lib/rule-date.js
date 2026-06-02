// rule-date.js

const AbstractRule = require("./abstractRule.js");

class DateRule extends AbstractRule {
  _coerce = false;

  // -------------------------
  // Configuration
  // -------------------------

  coerce() {
    this._coerce = true;
    return this;
  }

  min(value) {
    this._min = this._normalizeToDate(value);
    return this;
  }

  max(value) {
    this._max = this._normalizeToDate(value);
    return this;
  }

  // -------------------------
  // Core Validation
  // -------------------------

  check(data = {}) {
    let value = super.check(data);

    // Handle undefined/null after base logic
    if (value === undefined || value === null) {
      return value;
    }

    // Coerce if enabled
    if (this._coerce) {
      value = this._coerceToDate(value);
    }

    // Validate type
    if (!(value instanceof Date) || isNaN(value.getTime())) {
      throw new Error(`"${this._key}" must be a valid Date`);
    }

    // Min/Max validation
    if (this._min && value < this._min) {
      throw new Error(
        `"${this._key}" must be on or after ${this._min.toISOString()}`
      );
    }

    if (this._max && value > this._max) {
      throw new Error(
        `"${this._key}" must be on or before ${this._max.toISOString()}`
      );
    }

    return value;
  }

  // -------------------------
  // Helpers
  // -------------------------

  _coerceToDate(value) {
    if (value instanceof Date) return value;

    // number → timestamp
    if (typeof value === "number") {
      return new Date(value);
    }

    // string → parse
    if (typeof value === "string") {
      const parsed = new Date(value);
      return parsed;
    }

    return value; // let validation fail later
  }

  _normalizeToDate(value) {
    if (value instanceof Date) return value;

    const parsed = new Date(value);

    if (isNaN(parsed.getTime())) {
      throw new Error(`Invalid date provided for "${this._key}" constraint`);
    }

    return parsed;
  }
}

module.exports = DateRule;
