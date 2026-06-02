// rule-ipv4.js

const RegExRule = require("./regExRule");

class IPv4Rule extends RegExRule {
  _allowLeadingZeros = false;

  constructor(key) {
    // Strict IPv4 regex (0–255 per octet)
    const pattern =
      /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

    super(key, pattern);
  }

  // -------------------------
  // Configuration
  // -------------------------

  allowLeadingZeros(value = true) {
    this._allowLeadingZeros = value;
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
      throw new Error(`"${this._key}" must be a valid IPv4 address`);
    }

    return value;
  }

  // -------------------------
  // Helpers
  // -------------------------

  _updatePattern() {
    if (this._allowLeadingZeros) {
      // Allows leading zeros (e.g., 001.002.003.004)
      this._pattern =
        /^(25[0-5]|2[0-4]\d|1\d\d|0?\d?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|0?\d?\d)){3}$/;
    } else {
      // Default strict (no unnecessary leading zeros)
      this._pattern =
        /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
    }
  }
}

module.exports = IPv4Rule;
