// stringRule.js

const AbstractRule = require("./abstractRule");

class StringRule extends AbstractRule {
  _minLength;
  _maxLength;

  _pattern;

  _coerce = false;

  // -------------------------
  // Configuration
  // -------------------------

  coerce() {
    this._coerce = true;
    return this;
  }

  minLength(value) {
    this._minLength = value;
    return this;
  }

  maxLength(value) {
    this._maxLength = value;
    return this;
  }

  pattern(regex) {
    if (!(regex instanceof RegExp)) {
      throw new Error("pattern() expects a RegExp");
    }
    this._pattern = regex;
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

    if (this._coerce && typeof value !== "string") {
      value = String(value);
    }

    if (typeof value !== "string") {
      throw new Error(`"${this._key}" must be a string`);
    }

    value = this._applyTransforms(value);

    // Length checks
    if (this._minLength !== undefined && value.length < this._minLength) {
      throw new Error(
        `"${this._key}" must be at least ${this._minLength} characters`
      );
    }

    if (this._maxLength !== undefined && value.length > this._maxLength) {
      throw new Error(
        `"${this._key}" must be at most ${this._maxLength} characters`
      );
    }

    // Pattern check
    if (this._pattern && !this._pattern.test(value)) {
      throw new Error(`"${this._key}" does not match required pattern`);
    }

    return value;
  }

  // -------------------------
  // Transforms
  // -------------------------

  _applyTransforms(value) {
    if (typeof value !== "string") return value;

    if (this._trim) value = value.trim();
    if (this._lowercase) value = value.toLowerCase();
    else if (this._uppercase) value = value.toUpperCase();
    else if (this._titlecase) {
      value = value.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
    }

    for (const fn of this._transforms) {
      value = fn(value);
    }

    return value;
  }
}

module.exports = StringRule;
