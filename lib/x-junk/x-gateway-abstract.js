// AbstractGateway.js:

"use strict";

/**
 * AbstractGateway (Ultimate Version)
 *
 * Cross-database abstraction layer on top of Knex.
 * Handles:
 * - CRUD operations
 * - soft deletes
 * - transactions
 * - driver differences
 * - lifecycle hooks
 */
class AbstractGateway {
  constructor(database, tableName, primaryColumn = "id") {
    if (!database || !database.knex) {
      throw new Error("Database instance with knex is required");
    }
    if (!tableName) {
      throw new Error("tableName is required");
    }

    this._database = database;
    this._tableName = tableName;
    this.pk = primaryColumn;

    this._softDelete = false;
    this._deletedColumn = null;
  }

  // ---------- GETTERS ----------

  get database() {
    return this._database;
  }

  get knex() {
    return this._database.knex;
  }

  get knexClient() {
    return this.knex.client.config.client;
  }

  get tableName() {
    return this._tableName;
  }

  get primaryKey() {
    return this.pk;
  }

  // ---------- SOFT DELETE ----------

  enableSoftDelete(deletedColumn = "deleted_at") {
    this._softDelete = true;
    this._deletedColumn = deletedColumn;
  }

  // ---------- QUERY CORE ----------

  query(trx = null) {
    return trx ? trx(this._tableName) : this.knex(this._tableName);
  }

  baseQuery(trx = null) {
    const q = this.query(trx);

    if (this._softDelete && this._deletedColumn) {
      q.whereNull(this._deletedColumn);
    }

    return q;
  }

  // ---------- DRIVER HELPERS ----------

  _supportsReturning() {
    return ["pg", "oracledb", "mssql"].includes(this.client);
  }

  // ---------- HOOKS ----------

  async beforeInsert(record) {
    return record;
  }

  async afterInsert(result) {
    return result;
  }

  async beforeUpdate(updates) {
    return updates;
  }

  async afterUpdate(result) {
    return result;
  }

  async beforeDelete(where) {
    return where;
  }

  async afterDelete(result) {
    return result;
  }

  // ---------- CRUD ----------

  async insert(record, trx = null) {
    record = await this.beforeInsert(record);

    let query = this.query(trx).insert(record);

    if (this._supportsReturning()) {
      query = query.returning("*");
    }

    const result = await query;

    let output;

    if (this._supportsReturning()) {
      output = Array.isArray(result) ? result[0] : result;
    } else {
      // fallback for MySQL / SQLite
      const id = result[0];
      output = await this.findById(id, trx);
    }

    return this.afterInsert(output);
  }

  async findById(id, trx = null) {
    return this.baseQuery(trx).where(this.pk, id).first();
  }

  async find(where = {}, trx = null) {
    return this.baseQuery(trx).where(where);
  }

  async first(where = {}, trx = null) {
    return this.baseQuery(trx).where(where).first();
  }

  async update(where, updates, trx = null) {
    updates = await this.beforeUpdate(updates);

    let query = this.query(trx).where(where).update(updates);

    if (this._supportsReturning()) {
      query = query.returning("*");
    }

    const result = await query;

    let output;

    if (this._supportsReturning()) {
      output = result;
    } else {
      // fallback: re-query
      output = await this.find(where, trx);
    }

    return this.afterUpdate(output);
  }

  async delete(where, trx = null) {
    where = await this.beforeDelete(where);

    let result;

    if (this._softDelete && this._deletedColumn) {
      result = await this.update(
        where,
        { [this._deletedColumn]: new Date() },
        trx
      );
    } else {
      result = await this.query(trx).where(where).del();
    }

    return this.afterDelete(result);
  }

  // ---------- UTILITIES ----------

  async count(where = {}, trx = null) {
    const result = await this.baseQuery(trx)
      .where(where)
      .count({ count: "*" })
      .first();

    return Number(result.count || 0);
  }

  async exists(where = {}, trx = null) {
    const row = await this.first(where, trx);
    return !!row;
  }

  async paginate({ page = 1, pageSize = 10, where = {} } = {}, trx = null) {
    const offset = (page - 1) * pageSize;

    const [rows, total] = await Promise.all([
      this.baseQuery(trx).where(where).limit(pageSize).offset(offset),

      this.count(where, trx),
    ]);

    return {
      data: rows,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  // ---------- TRANSACTION HELPER ----------

  async transaction(callback) {
    return this.knex.transaction(async (trx) => {
      return callback(trx, this);
    });
  }
}

module.exports = AbstractGateway;
