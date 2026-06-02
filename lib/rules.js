// rules.js:

"use strict";

// -------------------------
// Rule type imports
// -------------------------

const BooleanRule = require(".//booleanRule.js");
const CompareRule = require(".//compareRule.js");
const DateRule = require(".//da  n nteRule.js");
const EmailRule = require(".//emailRule.js");
const EnumeratedRule = require(".//enumeratedRule.js");
const FloatRule = require(".//floatRule.js");
const IntegerRule = require(".//integerRule.js");
const IPV4Rule = require(".//IPV4Rule.js");
const IPV6Rule = require(".//ipv6Rule.js");
const JWTRule = require(".//jwtRule.js");
const NumberRule = require(".//numberRule.js");
const PasswordRule = require(".//passwordRule.js");
const PhoneRule = require(".//phoneRule.js");
const RegExRule = require(".//regExRule.js");
const StringRule = require(".//stringRule.js");
const TimeRule = require(".//timeRule.js");
const TimestampRule = require(".//timestampRule.js");

class RuleSet {
  /**
   * Internal collection of rules
   * @type {Array<AbstractRule>}
   * @private
   */
  _rules = [];

  /**
   * Creates a new RuleSet and invokes define()
   * @param {Object} data
   */
  constructor(data = {}) {
    // ensure fresh rule set per instance
    this._rules = [];

    this.define(data);
  }

  /**
   * Adds a rule to the RuleSet
   * @param {AbstractRule} rule
   * @returns {AbstractRule}
   */
  add(rule) {
    this._rules.push(rule);
    return rule;
  }

  /**
   * Must be implemented by subclasses to define rules
   * @param {Object} data
   */
  define(data) {
    throw new Error(
      `"${this.constructor.name}.define" method must be implemented`
    );
  }

  // -------------------------
  // Rule Builders
  // -------------------------

  boolean(key) {
    return this.add(new BooleanRule(key));
  }

  compare(key, compareKey) {
    return this.add(new CompareRule(key, compareKey));
  }

  date(key) {
    return this.add(new DateRule(key));
  }

  email(key) {
    return this.add(new EmailRule(key));
  }

  enumerated(key, values = []) {
    return this.add(new EnumeratedRule(key, values));
  }

  float(key) {
    return this.add(new FloatRule(key));
  }

  integer(key) {
    return this.add(new IntegerRule(key));
  }

  IPV4(key) {
    return this.add(new IPV4Rule(key));
  }

  IPV6(key) {
    return this.add(new IPV6Rule(key));
  }

  jwt(key) {
    return this.add(new JWTRule(key));
  }

  number(key) {
    return this.add(new NumberRule(key));
  }

  password(key) {
    return this.add(new PasswordRule(key));
  }

  phone(key) {
    return this.add(new PhoneRule(key));
  }

  regEx(key, pattern) {
    return this.add(new RegExRule(key, pattern));
  }

  string(key) {
    return this.add(new StringRule(key));
  }

  time(key) {
    return this.add(new TimeRule(key));
  }

  timestamp(key) {
    return this.add(new TimestampRule(key));
  }

  // -------------------------
  // Validation Execution
  // -------------------------

  /**
   * Executes all rules against the provided data object.
   *
   * - Does NOT throw errors
   * - Collects all validation errors
   * - Applies transformations and default values
   *
   * @param {Object} data
   * @returns {Object}
   */
  static check(data = {}) {
    // Validate input type early
    if (typeof data !== "object" || data === null) {
      return {
        statusCode: 400,
        data: {},
        errors: ["Input must be a valid object"],
      };
    }

    // ✅ build a fresh ruleset using the provided data
    const instance = new this(data);

    const errors = [];
    const output = { ...data };

    for (const rule of instance._rules) {
      try {
        const value = rule.check(output);

        if (value !== undefined) {
          output[rule._key] = value;
        }
      } catch (err) {
        const message =
          err && err.message ? err.message : `Invalid value for "${rule._key}"`;

        errors.push(message);
      }
    }

    return {
      statusCode: errors.length > 0 ? 400 : 200,
      data: output,
      errors,
    };
  }
}

module.exports = RuleSet;
