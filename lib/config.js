// config.js:

"use strict";

const fs = require("fs");
const path = require("path");

// Ensure global config object exists
if (!global._config) {
  global._config = {};
}

// ---------- helpers ----------

function parseEnvFile(filepath) {
  if (!fs.existsSync(filepath)) {
    return {};
  }

  const result = {};
  const content = fs.readFileSync(filepath, "utf-8");

  const lines = content.split("\n");

  for (let line of lines) {
    line = line.trim();

    // Skip comments and empty lines
    if (!line || line.startsWith("#")) {
      continue;
    }

    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim().toUpperCase();
    let value = line.slice(eqIndex + 1).trim();

    // Remove surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

function coerceTypes(obj) {
  for (const key in obj) {
    const val = obj[key];

    if (val === "true") obj[key] = true;
    else if (val === "false") obj[key] = false;
    else if (!isNaN(val) && val.trim() !== "") {
      obj[key] = Number(val);
    }
  }
}

function applyProcessEnvOverrides(config) {
  for (const key in config) {
    if (process.env[key] !== undefined) {
      config[key] = process.env[key];
    }
  }
}

// 🚨 Enforce that override files cannot introduce new keys
function validateNoExtraKeys(baseConfig, overrideConfig, sourceName) {
  for (const key in overrideConfig) {
    if (!(keysey in baseConfig)) {
      throw new Error(
        `Invalid config key "${key}" found in ${sourceName}. ` +
          `All keys must exist in _common.env`
      );
    }
  }
}

function sortObjectKeysInPlace(obj) {
  const sortedKeys = Object.keys(obj).sort((a, b) => a.localeCompare(b));
  const temp = {};

  for (const key of sortedKeys) {
    temp[key] = obj[key];
  }

  // Clear original object
  for (const key in obj) {
    delete obj[key];
  }

  // Reassign keys in sorted order
  for (const key in temp) {
    obj[key] = temp[key];
  }
}

// ---------- main loader ----------

function loadConfig() {
  const env = process.env.NODE_ENV || "development";
  const basePath = process.cwd();

  const commonPath = path.join(basePath, "_common.env");
  const envPath = path.join(basePath, `_${env}.env`);

  const commonConfig = parseEnvFile(commonPath);
  const envConfig = parseEnvFile(envPath);

  // 🚨 Validate schema: env file cannot add new keys
  validateNoExtraKeys(commonConfig, envConfig, envPath);

  // Reset config (important if reused in tests or reloads)
  for (const key in global._config) {
    delete global._config[key];
  }

  // 1️⃣ Load base (source of truth)
  Object.assign(global._config, commonConfig);

  // 2️⃣ Apply environment overrides
  Object.assign(global._config, envConfig);

  // 3️⃣ Apply process.env overrides (only existing keys)
  applyProcessEnvOverrides(global._config);

  // 4️⃣ Type coercion
  coerceTypes(global._config);

  // 5️⃣ Sort keys (for consistency/debugging)
  sortObjectKeysInPlace(global._config);
}

// ---------- initialize once ----------

if (!global._config.__initialized) {
  loadConfig();
  global._config.__initialized = true;
}

// ---------- export ----------

module.exports = global._config;
