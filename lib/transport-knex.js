// transport-knex.js

"use strict";

const AbstractTransport = require("./transport-abstract");

class KnexTransport extends AbstractTransport {
  constructor(config = {}) {
    super(config);

    if (!config.knex) {
      throw new Error("Knex instance is required");
    }

    this._knex = config.knex;
    this._idField = config.idField || "id";
  }

  // -----------------------------
  // Core query builder helper
  // -----------------------------
  _table(resource, options = {}) {
    const trx = options.trx;
    return trx ? trx(resource) : this._knex(resource);
  }

  _applyQuery(query, params = {}) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      query.where(key, value);
    }
    return query;
  }

  // -----------------------------
  // REQUIRED CORE METHOD
  // -----------------------------
  async request(method, resource, options = {}) {
    // Not used in Knex transport, but required by contract
    this.notImplemented("request");
  }

  // -----------------------------
  // READ OPERATIONS
  // -----------------------------
  async get(resource, options = {}) {
    const query = this._table(resource, options);

    if (options.params) {
      this._applyQuery(query, options.params);
    }

    if (options.orderBy) {
      query.orderBy(options.orderBy);
    }

    if (options.limit) {
      query.limit(options.limit);
    }

    if (options.offset) {
      query.offset(options.offset);
    }

    return query;
  }

  async read(resource, options = {}) {
    return this.get(resource, options);
  }

  // -----------------------------
  // CREATE
  // -----------------------------
  async post(resource, data = {}, options = {}) {
    const query = this._table(resource, options);

    const result = await query.insert(data);

    if (
      options.returning !== false &&
      this._knex.client.config.client !== "mysql"
    ) {
      return query.where(data).first();
    }

    return result;
  }

  async create(resource, data = {}, options = {}) {
    return this.post(resource, data, options);
  }

  // -----------------------------
  // UPDATE
  // -----------------------------
  async put(resource, data = {}, options = {}) {
    const query = this._table(resource, options);

    if (!options.params) {
      throw new Error("UPDATE requires params (where clause)");
    }

    this._applyQuery(query, options.params);

    await query.update(data);

    return query.first();
  }

  async update(resource, data = {}, options = {}) {
    return this.put(resource, data, options);
  }

  // -----------------------------
  // PATCH (partial update)
  // -----------------------------
  async patch(resource, data = {}, options = {}) {
    return this.put(resource, data, options);
  }

  // -----------------------------
  // DELETE
  // -----------------------------
  async delete(resource, options = {}) {
    const query = this._table(resource, options);

    if (!options.params) {
      throw new Error("DELETE requires params (where clause)");
    }

    this._applyQuery(query, options.params);

    return query.del();
  }

  async remove(resource, options = {}) {
    return this.delete(resource, options);
  }

  // -----------------------------
  // OPTIONAL: raw request fallback (not HTTP)
  // -----------------------------
  async postRaw(resource, data = {}, options = {}) {
    this.notImplemented("postRaw");
  }
}

module.exports = KnexTransport;
