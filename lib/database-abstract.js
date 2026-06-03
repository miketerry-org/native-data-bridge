// database-abstract.js

"use strict";

const Configurable = require("./configurable.js");

class AbstractDatabase extends Configurable {
  _connected;

  constructor(config = {}) {
    super(config);

    this._connected = false;
  }

  /**
   * Establish a connection to the underlying database.
   */
  async connect() {
    this.notImplemented("connect");
  }

  /**
   * Close the database connection.
   */
  async disconnect() {
    this.notImplemented("disconnect");
  }

  /**
   * Current connection state.
   */
  get connected() {
    return this._connected;
  }

  /**
   * Internal helper for subclasses.
   */
  _setConnected(value) {
    this._connected = !!value;
  }

  /**
   * HTTP-style methods
   */
  async get(resource, options = {}) {
    this.notImplemented("get");
  }

  async post(resource, values = {}, options = {}) {
    this.notImplemented("post");
  }

  async put(resource, values = {}, options = {}) {
    this.notImplemented("put");
  }

  async patch(resource, values = {}, options = {}) {
    this.notImplemented("patch");
  }

  async delete(resource, options = {}) {
    this.notImplemented("delete");
  }

  async head(resource, options = {}) {
    this.notImplemented("head");
  }

  /**
   * CRUD aliases
   */
  async create(resource, values = {}, options = {}) {
    return this.post(resource, values, options);
  }

  async read(resource, options = {}) {
    return this.get(resource, options);
  }

  async update(resource, values = {}, options = {}) {
    return this.patch(resource, values, options);
  }

  async remove(resource, options = {}) {
    return this.delete(resource, options);
  }
}

module.exports = AbstractDatabase;
