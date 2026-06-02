// resource-knex.js

"use strict";

const AbstractResource = require("./abstract-resource");

class KnexResource extends AbstractResource {
  constructor(config = {}) {
    super(config);

    if (!config.knex) {
      throw new Error("KnexResource requires a knex instance in config");
    }

    this.knex = config.knex;
    this.idField = config.idField || "id";
  }

  // -------------------------
  // INTERNAL HELPERS
  // -------------------------
  _table() {
    return this.knex(this.tableName);
  }

  _applyWhere(query, params = {}) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      query.where(key, value);
    }
    return query;
  }

  // -------------------------
  // READ
  // -------------------------
  async get(params = {}, context = {}) {
    let query = this._table();

    this._applyWhere(query, params);

    if (context.limit) query.limit(context.limit);
    if (context.offset) query.offset(context.offset);

    if (context.orderBy) {
      query.orderBy(context.orderBy);
    }

    return query;
  }

  // -------------------------
  // CREATE
  // -------------------------
  async post(data = {}, context = {}) {
    const result = await this._table().insert(data).returning("*");

    return Array.isArray(result) ? result[0] : result;
  }

  // -------------------------
  // UPDATE (PUT = full update)
  // -------------------------
  async put(data = {}, context = {}) {
    if (!context.params) {
      throw new Error("PUT requires context.params (WHERE clause)");
    }

    const query = this._applyWhere(this._table(), context.params);

    const result = await query.update(data).returning("*");

    return result;
  }

  // -------------------------
  // PATCH (partial update)
  // -------------------------
  async patch(data = {}, context = {}) {
    return this.put(data, context);
  }

  // -------------------------
  // DELETE
  // -------------------------
  async delete(params = {}, context = {}) {
    const query = this._applyWhere(this._table(), params);

    return query.del();
  }

  // -------------------------
  // OPTIONAL OVERRIDES (aliases already exist in AbstractResource)
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

module.exports = KnexResource;
