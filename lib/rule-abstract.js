// abstractRule.js

class AbstractRule {
  _key;
  _defaultValue;
  _required = false;

  _trim = false;
  _uppercase = false;
  _lowercase = false;
  _titlecase = false;

  _min;
  _max;

  _transforms = [];

  constructor(key) {
    if (!key || typeof key !== "string") {
      throw new Error("A valid key (string) is required");
    }

    this._key = key;
  }

  // -------------------------
  // Configuration Methods
  // -------------------------

  required() {
    this._required = true;
    return this;
  }

  optional() {
    this._required = false;
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

  defaultValue(value) {
    this._defaultValue = value;
    return this;
  }

  trim() {
    this._trim = true;
    return this;
  }

  toLowercase() {
    this._lowercase = true;
    this._uppercase = false;
    this._titlecase = false;
    return this;
  }

  toUppercase() {
    this._uppercase = true;
    this._lowercase = false;
    this._titlecase = false;
    return this;
  }

  toTitlecase() {
    this._titlecase = true;
    this._lowercase = false;
    this._uppercase = false;
    return this;
  }

  transform(fn) {
    if (typeof fn !== "function") {
      throw new Error("transform() expects a function");
    }

    this._transforms.push(fn);
    return this;
  }

  // -------------------------
  // Core Pipeline
  // -------------------------

  check(data = {}) {
    if (typeof data !== "object" || data === null) {
      throw new Error("check() expects an object");
    }

    let value = data[this._key];

    // 1. Handle missing values
    if (value === undefined || value === null) {
      if (this._defaultValue !== undefined) {
        value = this._defaultValue;
      } else if (this._required) {
        throw new Error(`"${this._key}" is required`);
      } else {
        return value;
      }
    }

    // 2. Apply transforms
    value = this._applyTransforms(value);

    // 3. Run validation
    this._validate(value);

    return value;
  }

  // -------------------------
  // Transform Logic
  // -------------------------

  _applyTransforms(value) {
    // Built-in string transforms
    if (typeof value === "string") {
      if (this._trim) {
        value = value.trim();
      }

      if (this._lowercase) {
        value = value.toLowerCase();
      } else if (this._uppercase) {
        value = value.toUpperCase();
      } else if (this._titlecase) {
        value = value
          .toLowerCase()
          .replace(/\b\w/g, char => char.toUpperCase());
      }
    }

    // Custom transforms
    for (const fn of this._transforms) {
      value = fn(value);
    }

    return value;
  }

  // -------------------------
  // Validation Hook
  // -------------------------

  _validate(value) {
    // Generic min/max (subclasses should override meaning if needed)
    if (this._max !== undefined && value > this._max) {
      throw new Error(`"${this._key}" cannot be greater than ${this._max}`);
    }

    if (this._min !== undefined && value < this._min) {
      throw new Error(`"${this._key}" cannot be less than ${this._min}`);
    }
  }

  // -------------------------
  // Utility
  // -------------------------

  notImplemented(method) {
    throw new Error(
      `The "${this.constructor.name}.${method}" method must be overridden!`
    );
  }
}

// Export (CommonJS)
module.exports = AbstractRule;
