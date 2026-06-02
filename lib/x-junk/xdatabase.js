// database.js:

"use strict";

class AbstractDatabase extends Abstract {
  constructor(config) {
    this._config = { ...config };
    this._checkConfig();
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

  async insertMany(rows = [], options = {}) {
    this.notImplemented("insertMany");
  }

  async updateOne(table, row, where = {}, options = {}) {
    this.notImplemented("updateOne");
  }

  async updateMany(table, rows, where, options = {}) {
    this.notImplemented("updateMany");
  }

  async updateById(id, row, options = {}) {
    this.notImplemented("updateById");
  }

  async deleteOne(table, where, options = {}) {
    this.notImplemented("deleteOne");
  }

  async deleteMany(table, where, options = {}) {
    this.notImplemented("deleteMany");
  }

  async deleteById(table, id, options = {}) {
    this.notImplemented("deleteById");
  }
}

class KnexDatabase extends AbstracctDatabase {}

class SqliteDatabase extends KnexDatabase {}

class PostgressDatabase extends KnexDatabase {}

class HttpDatabase extends AbstractDatabase {}

module.exports = {
  AbstractDatabase,
  KnexDatabase,
  SqliteDatabase,
  PostgressDatabase,
  HttpDatabase,
};
