// booleanRule.js

const AbstractRule = require("./abstractRule");

class BooleanRule extends AbstractRule {
  _coerce = false;

  // -------------------------
  // Configuration
  // -------------------------

  coerce() {
    this._coerce = true;
    return this;
  }

  // -------------------------
  // Core Validation
  // -------------------------

  check(data = {}) {
    let value = super.check(data);

    // If value is still undefined/null after base handling, return early
    if (value === undefined || value === null) {
      return value;
    }

    // Optional coercion
    if (this._coerce) {
      value = this._coerceToBoolean(value);
    }

    // Final type check
    if (typeof value !== "boolean") {
      throw new Error(`"${this._key}" must be a boolean`);
    }

    return value;
  }

  // -------------------------
  // Helpers
  // -------------------------

  _coerceToBoolean(value) {
    if (typeof value === "boolean") return value;

    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();

      if (["true", "1", "yes", "y"].includes(normalized)) return true;
      if (["false", "0", "no", "n"].includes(normalized)) return false;
    }

    if (typeof value === "number") {
      if (value === 1) return true;
      if (value === 0) return false;
    }

    return value; // let validation fail later
  }
}

module.exports = BooleanRule;
