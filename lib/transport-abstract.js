// transport-abstract.js

"use strict";

const Abstract = require("./abstract.js");

class AbstractTransport extends Abstract {
  constructor(config = {}) {
    super(config);
  }

  /**
   * Execute a transport request.
   *
   * @param {string} method
   * @param {string} resource
   * @param {object} options
   * @returns {Promise<*>}
   */
  async request(method, resource, options = {}) {
    this.notImplemented("request");
  }

  /**
   * GET
   */
  async get(resource, options = {}) {
    return this.request("GET", resource, options);
  }

  /**
   * POST
   */
  async post(resource, data = {}, options = {}) {
    return this.request("POST", resource, {
      ...options,
      data,
    });
  }

  /**
   * PUT
   */
  async put(resource, data = {}, options = {}) {
    return this.request("PUT", resource, {
      ...options,
      data,
    });
  }

  /**
   * PATCH
   */
  async patch(resource, data = {}, options = {}) {
    return this.request("PATCH", resource, {
      ...options,
      data,
    });
  }

  /**
   * DELETE
   */
  async delete(resource, options = {}) {
    return this.request("DELETE", resource, options);
  }

  /**
   * CRUD aliases
   */
  async create(resource, data = {}, options = {}) {
    return this.post(resource, data, options);
  }

  async read(resource, options = {}) {
    return this.get(resource, options);
  }

  async update(resource, data = {}, options = {}) {
    return this.put(resource, data, options);
  }

  async remove(resource, options = {}) {
    return this.delete(resource, options);
  }
}

module.exports = AbstractTransport;
