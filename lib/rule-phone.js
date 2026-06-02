// rule-phone.js

const RegExRule = require("./regExRule.js");

class PhoneRule extends RegExRule {
  _strict = false;

  constructor(key) {
    // Default: flexible international + US formats
    const basePattern = /^[\d\s()+\-]+$/;

    super(key, basePattern);
  }

  // -------------------------
  // Configuration
  // -------------------------

  strict() {
    this._strict = true;
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

    // Normalize: remove spaces, dashes, parentheses
    value = value.trim().replace(/[\s\-()]/g, "");

    // Handle leading "+"
    const hasPlus = value.startsWith("+");
    if (hasPlus) {
      value = "+" + value.slice(1).replace(/\D/g, "");
    } else {
      value = value.replace(/\D/g, "");
    }

    // Validate format after normalization
    if (!this._pattern.test(value)) {
      throw new Error(`"${this._key}" must be a valid phone number`);
    }

    return value;
  }

  // -------------------------
  // Helpers
  // -------------------------

  _updatePattern() {
    if (this._strict) {
      // E.164 format: + followed by 8–15 digits
      this._pattern = /^\+[1-9]\d{7,14}$/;
    } else {
      // Flexible: allows optional "+" and 7+ digits
      this._pattern = /^\+?\d{7,15}$/;
    }
  }
}

module.exports = PhoneRule;
