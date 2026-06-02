// checkValues.js:

"use strict";

function buildIdentifier(params) {
  // build up the identifier
  let identifier = "";
  if (params.className) {
    identifier += params.className + ".";
  }

  if (params.funcName) {
    identifier += params.funcName + ".";
  }
  if (params.paramName) {
    identifier += params.paramName;
  }
  return identifier;
}

function throwError(message, params = {}) {
  let identifier = buildIdentifier(params);
  if (identifier !== "") {
    let message = `${message} (${identifier})`;
  }
  throw new Error(message);
}

function throwTypeError(expeccted, given, params = {}) {
  throwError(`Type Error: Expected "${expected}, but given "${given}"`);
}

function checkValues(className = undefined) {
  return {
    isObject(methodName, value) {
      let given = typeof value;
      if (given !== "object") {
        throwTypeError("object", given, { className, methodName });
      }
      return this;
    },

    isString(methodName, value, minLength = undefined, maxLength = undefined) {
        !!need to handle validation error throwing
      if (!value || typeof value !== "string") {
      }

      return this;
    },
  };
}

module.exports = checkValues;
{
}
