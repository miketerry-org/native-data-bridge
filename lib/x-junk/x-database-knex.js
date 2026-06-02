// Database-knex.js:

"use strict";

const AbstractDatabase = require("./database-abstract.js");
const knex = require("knex");

class KnexDatabase extends AbstractDatabase {
  #db = null;

  _checkConfig() {
    if (!this._config.client) {
      throw new Error("Database client is required");
    }

    if (!this._config.connection) {
      throw new Error("Database connection is required");
    }
  }

  async connect() {
    if (this.#db) {
      return this.#db;
    }

    this.#db = knex(this._config);

    await this.#db.raw("select 1");

    return this.#db;
  }

  async disconnect() {
    if (!this.#db) {
      return;
    }

    await this.#db.destroy();
    this.#db = null;
  }

  get connected() {
    return !!this.#db;
  }

  async findOne(table, where = {}, options = {}) {
    const query = this.#buildQuery(table, where, options);

    const row = await query.first();

    return row || null;
  }

  async findMany(table, where = {}, options = {}) {
    const query = this.#buildQuery(table, where, options);

    return await query;
  }

  async findById(table, id, options = {}) {
    const idField = options.idField || "id";

    return this.findOne(table, { [idField]: id }, options);
  }

  async insertOne(table, row = {}, options = {}) {
    const query = this.#db(table);

    if (options.returning !== false) {
      const result = await query.insert(row).returning("*");

      return Array.isArray(result) ? result[0] : result;
    }

    return await query.insert(row);
  }

  async insertMany(table, rows = [], options = {}) {
    const query = this.#db(table);

    if (options.returning !== false) {
      return await query.insert(rows).returning("*");
    }

    return await query.insert(rows);
  }

  async updateOne(table, row, where = {}, options = {}) {
    const existing = await this.findOne(table, where, options);

    if (!existing) {
      return null;
    }

    const idField = options.idField || "id";

    return this.updateById(table, existing[idField], row, options);
  }

  async updateMany(table, rows = {}, where = {}, options = {}) {
    const query = this.#db(table).where(where);

    if (options.returning !== false) {
      return await query.update(rows).returning("*");
    }

    return await query.update(rows);
  }

  async updateById(table, id, row, options = {}) {
    const idField = options.idField || "id";

    const query = this.#db(table).where({ [idField]: id });

    if (options.returning !== false) {
      const result = await query.update(row).returning("*");

      return result?.[0] || null;
    }

    await query.update(row);

    return this.findById(table, id, options);
  }

  async deleteOne(table, where = {}, options = {}) {
    const existing = await this.findOne(table, where, options);

    if (!existing) {
      return 0;
    }

    const idField = options.idField || "id";

    return this.deleteById(table, existing[idField], options);
  }

  async deleteMany(table, where = {}, options = {}) {
    return await this.#db(table).where(where).del();
  }

  async deleteById(table, id, options = {}) {
    const idField = options.idField || "id";

    return await this.#db(table)
      .where({ [idField]: id })
      .del();
  }

  #buildQuery(table, where = {}, options = {}) {
    const query = this.#db(table);

    if (Object.keys(where).length) {
      query.where(where);
    }

    if (options.select?.length) {
      query.select(options.select);
    } else {
      query.select("*");
    }

    if (options.orderBy) {
      const orderBy = Array.isArray(options.orderBy)
        ? options.orderBy
        : [options.orderBy];

      for (const item of orderBy) {
        if (typeof item === "string") {
          query.orderBy(item);
        } else {
          query.orderBy(item.column, item.direction || "asc");
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
}
