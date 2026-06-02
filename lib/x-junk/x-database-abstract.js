// database-abstract.js:

"use strict";

const Abstract = require("./abstract.js");

class AbstractDatabase extends Abstract {
  constructor(config = {}) {
    super();

    this._config = { ...config };
    this._checkConfig();
  }

  get config() {
    return { ...this._config };
  }

  _checkConfig() {
    this.notImplemented("_checkConfig");
  }

  async connect() {
    this.notImplemented("connect");
  }

  async disconnect() {
    this.notImplemented("disconnect");
  }

  get connected() {
    this.notImplemented("connected");
  }

  async findOne(table, where = {}, options = {}) {
    this.notImplemented("findOne");
  }

  async findMany(table, where = {}, options = {}) {
    this.notImplemented("findMany");
  }

  async findById(table, id, options = {}) {
    this.notImplemented("findById");
  }

  async insertOne(table, row = {}, options = {}) {
    this.notImplemented("insertOne");
  }

  async insertMany(table, rows = [], options = {}) {
    this.notImplemented("insertMany");
  }

  async updateOne(table, row = {}, where = {}, options = {}) {
    this.notImplemented("updateOne");
  }

  async updateMany(table, rows = {}, where = {}, options = {}) {
    this.notImplemented("updateMany");
  }

  async updateById(table, id, row = {}, options = {}) {
    this.notImplemented("updateById");
  }

  async deleteOne(table, where = {}, options = {}) {
    this.notImplemented("deleteOne");
  }

  async deleteMany(table, where = {}, options = {}) {
    this.notImplemented("deleteMany");
  }

  async deleteById(table, id, options = {}) {
    this.notImplemented("deleteById");
  }

  async count(table, where = {}, options = {}) {
    this.notImplemented("count");
  }

  async exists(table, where = {}, options = {}) {
    this.notImplemented("exists");
  }

  async transaction(callback, options = {}) {
    this.notImplemented("transaction");
  }

  async create(table, row = {}, options = {}) {
    return this.insertOne(table, row, options);
  }

  async update(table, row = {}, where = {}, options = {}) {
    return this.updateOne(table, row, where, options);
  }

  async delete(table, where = {}, options = {}) {
    return this.deleteOne(table, where, options);
  }
}

module.exports = AbstractDatabase;
