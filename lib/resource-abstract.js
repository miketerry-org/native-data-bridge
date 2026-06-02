"use strict";

const Abstract = require("./abstract");
const pluralize = require("pluralize");

class AbstractResource extends Abstract {
  constructor(config = {}) {
    super(config);

    const className = this.constructor.name;

    // Strip "Resource" suffix only
    if (!className.endsWith("Resource")) {
      throw new Error(
        `Invalid resource class name "${className}". ` +
          `All resources must end with "Resource".`
      );
    }

    const baseName = className.slice(0, -9); // remove "Resource"

    if (!baseName) {
      throw new Error("Resource name cannot be empty");
    }

    // API resource name (singular, lowercase)
    this.resourceName = baseName.toLowerCase();

    // DB table name (pluralized)
    this.tableName = pluralize(this.resourceName);

    this.transport = null;
  }

  /**
   * Inject ServerTransport instance
   */
  bindTransport(transport) {
    this.transport = transport;
    return this;
  }

  // -------------------------
  // HTTP-style contract
  // -------------------------
  async get(params = {}, context = {}) {
    this.notImplemented("get");
  }

  async post(data = {}, context = {}) {
    this.notImplemented("post");
  }

  async put(data = {}, context = {}) {
    this.notImplemented("put");
  }

  async patch(data = {}, context = {}) {
    this.notImplemented("patch");
  }

  async delete(params = {}, context = {}) {
    this.notImplemented("delete");
  }

  // -------------------------
  // Transport aliases
  // -------------------------
  async read(params = {}, context = {}) {
    return this.get(params, context);
  }

  async create(data = {}, context = {}) {
    return this.post(data, context);
  }

  async update(data = {}, context = {}) {
    return this.put(data, context);
  }

  async remove(params = {}, context = {}) {
    return this.delete(params, context);
  }
}

module.exports = AbstractResource;
