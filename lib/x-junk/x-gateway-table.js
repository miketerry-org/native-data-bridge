// tableDataGateway.js:

"use strict";

const DataGateway = require("./dataGateway");

/**
 * TableDataGateway (Ultimate Compatible)
 *
 * Lightweight table-level data access layer with validation, soft delete, and cross-DB support.
 */
class TableDataGateway extends DataGateway {
  constructor(database, tableName, primaryColumn = "id") {
    super(database, tableName, primaryColumn);
  }

  // ---------- RULESET HELPERS ----------

  _validateRuleSet(ruleSet) {
    if (!ruleSet) return;
    if (typeof ruleSet !== "function")
      throw new Error("ruleSet must be a class");
    if (typeof ruleSet.check !== "function")
      throw new Error("ruleSet must implement static check(data)");
  }

  _applyRuleSet(record, ruleSet) {
    if (!ruleSet) return record;
    this._validateRuleSet(ruleSet);
    const result = ruleSet.check(record);
    if (!result || typeof result !== "object")
      throw new Error("ruleSet.check() must return an object");
    if (result.statusCode !== 200) throw new Error(result.errors.join(", "));
    return result.data;
  }

  // ---------- SELECT / FIND ----------

  async count(where = {}) {
    const result = await this.baseQuery()
      .where(where)
      .count({ count: "*" })
      .first();
    return Number(result.count);
  }

  async exists(where) {
    const result = await this.baseQuery().where(where).first();
    return !!result;
  }

  async find(where = {}, columns = "*") {
    return this.baseQuery().where(where).select(columns);
  }

  async findByColumn(column, value, columns = "*") {
    return this.baseQuery()
      .where({ [column]: value })
      .select(columns);
  }

  async findById(id, columns = "*") {
    this.requireId(id);
    const result = await this.baseQuery()
      .where({ [this.pk]: id })
      .select(columns)
      .first();
    return result || null;
  }

  async findPage({ where = {}, page = 1, pageSize = 25, columns = "*" }) {
    const offset = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      this.baseQuery()
        .where(where)
        .select(columns)
        .limit(pageSize)
        .offset(offset),
      this.count(where),
    ]);
    return { data, page, pageSize, total };
  }

  // ---------- INSERT ----------

  async insertOne(record, ruleSet = undefined, trx = null) {
    record = this._applyRuleSet(record, ruleSet);
    record = await this.beforeInsert(record);

    const result = await this.insert(record, trx);
    return await this.afterInsert(result);
  }

  async insertMany(records, ruleSet = undefined, trx = null) {
    if (ruleSet) records = records.map((r) => this._applyRuleSet(r, ruleSet));
    records = await Promise.all(records.map((r) => this.beforeInsert(r)));
    const result = await this.insert(records, trx);
    return await this.afterInsert(result);
  }

  // ---------- UPDATE ----------

  async updateById(id, updates, ruleSet = undefined, trx = null) {
    this.requireId(id);
    updates = this._applyRuleSet(updates, ruleSet);
    updates = await this.beforeUpdate(updates);
    const result = await this.update({ [this.pk]: id }, updates, trx);
    return await this.afterUpdate(result);
  }

  async updateMany(where, updates, ruleSet = undefined, trx = null) {
    updates = this._applyRuleSet(updates, ruleSet);
    updates = await this.beforeUpdate(updates);
    const result = await this.update(where, updates, trx);
    return await this.afterUpdate(result);
  }

  async updateOne(where, updates, ruleSet = undefined, trx = null) {
    updates = this._applyRuleSet(updates, ruleSet);
    updates = await this.beforeUpdate(updates);
    const result = await this.update(where, updates, trx);
    return await this.afterUpdate(result);
  }

  // ---------- DELETE ----------

  async deleteById(id, trx = null) {
    this.requireId(id);
    if (this._softDelete && this._deletedColumn) {
      const updates = { [this._deletedColumn]: new Date() };
      return await this.updateById(id, updates, undefined, trx);
    } else {
      const result = await this.delete({ [this.pk]: id }, trx);
      return result;
    }
  }

  async deleteMany(where, trx = null) {
    return await this.delete(where, trx);
  }

  async deleteOne(where, trx = null) {
    return await this.delete(where, trx);
  }

  // ---------- UPSERT ----------

  async upsert(
    record,
    conflictColumns = [this.pk],
    ruleSet = undefined,
    trx = null
  ) {
    record = this._applyRuleSet(record, ruleSet);
    record = await this.beforeInsert(record);

    return await this.upsertRecord(record, conflictColumns, trx);
  }

  // ---------- INTERNAL CROSS-DB UPSERT ----------

  async upsertRecord(record, conflictColumns = [this.pk], trx = null) {
    const client = this.client;

    // Native support for Postgres, MySQL, SQLite
    if (["pg", "mysql2", "sqlite3"].includes(client)) {
      let query = this.query(trx)
        .insert(record)
        .onConflict(conflictColumns)
        .merge();
      if (this._supportsReturning()) query = query.returning("*");
      const result = await query;

      let output = this._supportsReturning()
        ? Array.isArray(result)
          ? result[0]
          : result
        : await this.findById(record[conflictColumns[0]], "*");

      return output;
    }

    // Fallback for MSSQL / Oracle
    const exists = await this.exists({
      [conflictColumns[0]]: record[conflictColumns[0]],
    });
    if (exists) {
      return await this.updateOne(
        { [conflictColumns[0]]: record[conflictColumns[0]] },
        record
      );
    } else {
      return await this.insertOne(record);
    }
  }
}

module.exports = TableDataGateway;
