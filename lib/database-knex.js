// database-knex.js

"use strict";

const knex = require("knex");
const AbstractDatabase = require("./database-abstract.js");

class KnexDatabase extends AbstractDatabase {
  _knex;

  constructor(config = {}) {
    super(config);

    this._config = { ...config };
    this._knex = null;
  }

  /**
   * Create knex instance.
   */
  async connect() {
    if (this.connected) {
      return this;
    }

    this._knex = knex(this._config);

    // Verify connection
    await this._knex.raw("select 1");

    this._setConnected(true);

    return this;
  }

  /**
   * Destroy knex instance.
   */
  async disconnect() {
    if (!this.connected) {
      return;
    }

    await this._knex.destroy();

    this._knex = null;

    this._setConnected(false);
  }

  /**
   * Expose underlying knex instance.
   */
  get knex() {
    return this._knex;
  }

  /**
   * Get query builder for resource.
   */
  _table(resource, options = {}) {
    const trx = options.trx;

    return trx ? trx(resource) : this._knex(resource);
  }

  /**
   * Apply where filters.
   */
  _applyWhere(query, where = {}) {
    for (const [key, value] of Object.entries(where)) {
      if (value === undefined || value === null) {
        continue;
      }

      if (Array.isArray(value)) {
        query.whereIn(key, value);
      } else {
        query.where(key, value);
      }
    }

    return query;
  }

  /**
   * Apply common query options.
   */
  _applyOptions(query, options = {}) {
    if (options.orderBy) {
      if (typeof options.orderBy === "string") {
        query.orderBy(options.orderBy);
      } else if (Array.isArray(options.orderBy)) {
        for (const order of options.orderBy) {
          query.orderBy(order.column, order.direction || "asc");
        }
      }
    }

    if (options.limit) {
      query.limit(options.limit);
    }

    if (options.offset) {
      query.offset(options.offset);
    }

    return query;
  }

  /**
   * GET
   *
   * options:
   * {
   *   where: {},
   *   limit,
   *   offset,
   *   orderBy,
   *   first
   * }
   */
  async get(resource, options = {}) {
    let query = this._table(resource, options);

    query = this._applyWhere(query, options.where);

    query = this._applyOptions(query, options);

    if (options.first) {
      return query.first();
    }

    return query;
  }

  /**
   * INSERT
   */
  async post(resource, values = {}, options = {}) {
    const query = this._table(resource, options);

    const returning = options.returning || "*";

    const result = await query.insert(values).returning(returning);

    return result;
  }

  /**
   * FULL UPDATE
   *
   * options.where is required.
   */
  async put(resource, values = {}, options = {}) {
    if (!options.where) {
      throw new Error("PUT requires options.where");
    }

    let query = this._table(resource, options);

    query = this._applyWhere(query, options.where);

    const returning = options.returning || "*";

    return query.update(values).returning(returning);
  }

  /**
   * PARTIAL UPDATE
   */
  async patch(resource, values = {}, options = {}) {
    if (!options.where) {
      throw new Error("PATCH requires options.where");
    }

    let query = this._table(resource, options);

    query = this._applyWhere(query, options.where);

    const returning = options.returning || "*";

    return query.update(values).returning(returning);
  }

  /**
   * DELETE
   */
  async delete(resource, options = {}) {
    if (!options.where) {
      throw new Error("DELETE requires options.where");
    }

    let query = this._table(resource, options);

    query = this._applyWhere(query, options.where);

    return query.del();
  }

  /**
   * HEAD
   *
   * Returns true if matching row exists.
   */
  async head(resource, options = {}) {
    let query = this._table(resource, options);

    query = this._applyWhere(query, options.where);

    const row = await query.first();

    return !!row;
  }
}

module.exports = KnexDatabase;
