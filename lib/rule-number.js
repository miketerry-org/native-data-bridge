// numberRule.js

const AbstractRule = require("./abstractRule.js");

class NumberRule extends AbstractRule {
  _min;
  _max;

  _integer = false;
  _coerce = false;

  _precision;
  _multipleOf;

  _positive = false;
  _negative = false;
  _nonNegative = false;
  _nonPositive = false;

  // -------------------------
  // Configuration
  // -------------------------

  coerce() {
    this._coerce = true;
    return this;
  }

  min(value) {
    this._min = value;
    return this;
  }

  max(value) {
    this._max = value;
    return this;
  }

  integer() {
    this._integer = true;
    return this;
  }

  float() {
    this._integer = false;
    return this;
  }

  precision(value) {
    this._precision = value;
    return this;
  }

  multipleOf(value) {
    this._multipleOf = value;
    return this;
  }

  positive() {
    this._positive = true;
    return this;
  }

  negative() {
    this._negative = true;
    return this;
  }

  nonNegative() {
    this._nonNegative = true;
    return this;
  }

  nonPositive() {
    this._nonPositive = true;
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

    // Coerce string → number
    if (this._coerce && typeof value === "string") {
      value = Number(value);
    }

    // Type check
    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new Error(`"${this._key}" must be a valid number`);
    }

    // Block Infinity / -Infinity
    if (!Number.isFinite(value)) {
      throw new Error(`"${this._key}" must be a finite number`);
    }

    // Integer enforcement (optional)
    if (this._integer && !Number.isInteger(value)) {
      throw new Error(`"${this._key}" must be an integer`);
    }

    // Min / Max
    if (this._min !== undefined && value < this._min) {
      throw new Error(`"${this._key}" must be >= ${this._min}`);
    }

    if (this._max !== undefined && value > this._max) {
      throw new Error(`"${this._key}" must be <= ${this._max}`);
    }

    // Sign constraints
    if (this._positive && value <= 0) {
      throw new Error(`"${this._key}" must be greater than 0`);
    }

    if (this._negative && value >= 0) {
      throw new Error(`"${this._key}" must be less than 0`);
    }

    if (this._nonNegative && value < 0) {
      throw new Error(`"${this._key}" must be >= 0`);
    }

    if (this._nonPositive && value > 0) {
      throw new Error(`"${this._key}" must be <= 0`);
    }

    // Precision (decimal places)
    if (this._precision !== undefined) {
      const parts = value.toString().split(".");
      const decimals = parts[1];

      if (decimals && decimals.length > this._precision) {
        throw new Error(
          `"${this._key}" must have at most ${this._precision} decimal places`
        );
      }
    }

    // Multiple-of check
    if (this._multipleOf !== undefined) {
      if (value % this._multipleOf !== 0) {
        throw new Error(
          `"${this._key}" must be a multiple of ${this._multipleOf}`
        );
      }
    }

    return value;
  }
}

module.exports = NumberRule;
