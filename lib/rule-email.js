// rule-email.js

const RegExRule = require("./regExRule.js");

class EmailRule extends RegExRule {
  _allowPlus = true;
  _strict = false;

  constructor(key) {
    // Reasonable default email regex
    const basePattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  allowPlus(value = true) {
    this._allowPlus = value;
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

    // Normalize email (common best practice)
    value = value.trim().toLowerCase();

    // Re-validate using updated regex
    if (!this._pattern.test(value)) {
      throw new Error(`"${this._key}" must be a valid email address`);
    }

    return value;
  }

  // -------------------------
  // Helpers
  // -------------------------

  _updatePattern() {
    // Base structure: local@domain.tld
    let local = this._allowPlus ? "[^\\s@]+" : "[^\\s@+]+";

    let domain = this._strict ? "[a-z0-9.-]+" : "[^\\s@]+";

    const pattern = new RegExp(`^${local}@${domain}\\.[^\\s@]+$`, "i");

    this._pattern = pattern;
  }
}

module.exports = EmailRule;
