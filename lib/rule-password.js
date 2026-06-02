// passwordRule.js

const StringRule = require("./stringRule.js");

class PasswordRule extends StringRule {
  _minUppercase = 0;
  _minLowercase = 0;
  _minDigits = 0;
  _minSymbols = 0;

  // -------------------------
  // Configuration
  // -------------------------

  minUppercase(value) {
    this._minUppercase = value;
    return this;
  }

  minLowercase(value) {
    this._minLowercase = value;
    return this;
  }

  minDigits(value) {
    this._minDigits = value;
    return this;
  }

  minSymbols(value) {
    this._minSymbols = value;
    return this;
  }

  // -------------------------
  // Validation
  // -------------------------

  check(data = {}) {
    const value = super.check(data);

    if (value === undefined || value === null) {
      return value;
    }

    const counts = this._countCharacters(value);

    if (counts.uppercase < this._minUppercase) {
      throw new Error(
        `"${this._key}" must contain at least ${this._minUppercase} uppercase letter(s)`
      );
    }

    if (counts.lowercase < this._minLowercase) {
      throw new Error(
        `"${this._key}" must contain at least ${this._minLowercase} lowercase letter(s)`
      );
    }

    if (counts.digits < this._minDigits) {
      throw new Error(
        `"${this._key}" must contain at least ${this._minDigits} digit(s)`
      );
    }

    if (counts.symbols < this._minSymbols) {
      throw new Error(
        `"${this._key}" must contain at least ${this._minSymbols} symbol(s)`
      );
    }

    return value;
  }

  // -------------------------
  // Helpers
  // -------------------------

  _countCharacters(value) {
    let uppercase = 0;
    let lowercase = 0;
    let digits = 0;
    let symbols = 0;

    for (const char of value) {
      if (/[A-Z]/.test(char)) uppercase++;
      else if (/[a-z]/.test(char)) lowercase++;
      else if (/[0-9]/.test(char)) digits++;
      else symbols++;
    }

    return { uppercase, lowercase, digits, symbols };
  }
}

module.exports = PasswordRule;
