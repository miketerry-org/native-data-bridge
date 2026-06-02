// jwtRule.js

const RegExRule = require("./regexRule.js");

class JwtRule extends RegExRule {
  constructor(key) {
    // 3 base64url segments separated by dots
    const pattern = /^[A-Za-z0-9\-_]+\.([A-Za-z0-9\-_]+)\.([A-Za-z0-9\-_]+)$/;

    super(key, pattern);
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
      throw new Error(`"${this._key}" must be a valid JWT format`);
    }

    return value;
  }
}

module.exports = JwtRule;
