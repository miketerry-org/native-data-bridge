// RowDataGateway.js:

"use strict";

const DataGateway = require("./dataGateway");

/**
 * RowDataGateway (Ultimate Compatible)
 *
 * Represents a single row with full CRUD, validation, and state tracking.
 * Delegates persistence to DataGateway.
 */
class RowGateway extends DataGateway {
  constructor(database, tableName, row = {}, primaryColumn = "id") {
    super(database, tableName, primaryColumn);

    this.row = { ...row };
    this._isNew = this.row[this.pk] === undefined;
  }

  // ---------- PROPERTIES ----------

  get id() {
    return this.row[this.pk];
  }

  get isNew() {
    return this._isNew;
  }

  // ---------- RULESET HELPERS ----------

  _validateRuleSet(ruleSet) {
    if (!ruleSet) return;

    if (typeof ruleSet !== "function") {
      throw new Error("ruleSet must be a class");
    }

    if (typeof ruleSet.check !== "function") {
      throw new Error("ruleSet must implement static check(data)");
    }
  }

  _applyRuleSet(data, ruleSet) {
    if (!ruleSet) return data;

    this._validateRuleSet(ruleSet);

    const result = ruleSet.check(data);

    if (!result || typeof result !== "object") {
      throw new Error("ruleSet.check() must return a result object");
    }

    if (result.statusCode !== 200) {
      throw new Error(result.errors.join(", "));
    }

    return result.data;
  }

  // ---------- CRUD ----------

  async insert(ruleSet = undefined, trx = null) {
    if (!this._isNew) {
      throw new Error("Cannot insert: row already has a primary key");
    }

    let record = this._applyRuleSet(this.row, ruleSet);

    const result = await super.insert(record, trx);

    this.row = { ...result };
    this._isNew = false;

    return this.row;
  }

  async update(updates = {}, ruleSet = undefined, trx = null) {
    if (this._isNew) {
      throw new Error("Cannot update: row has no primary key");
    }

    updates = this._applyRuleSet(updates, ruleSet);

    const result = await super.update({ [this.pk]: this.id }, updates, trx);

    if (result) {
      // result may be array (pg) or rows (fallback)
      const updated = Array.isArray(result) ? result[0] : result[0] || result;

      if (updated) {
        this.row = { ...updated };
      }
    }

    return this.row;
  }

  async save(ruleSet = undefined, trx = null) {
    if (this._isNew) {
      return this.insert(ruleSet, trx);
    }

    const updates = this._applyRuleSet(this.row, ruleSet);
    return this.update(updates, undefined, trx);
  }

  async delete(trx = null) {
    if (this._isNew) {
      throw new Error("Cannot delete: row has no primary key");
    }

    const result = await super.delete({ [this.pk]: this.id }, trx);

    return result;
  }

  async reload(trx = null) {
    if (this._isNew) return null;

    const result = await super.findById(this.id, trx);

    if (result) {
      this.row = { ...result };
    }

    return this.row || null;
  }

  /**
   * Upsert (cross-db best effort)
   *
   * Note:
   * - Uses native ON CONFLICT where supported
   * - Falls back to manual upsert otherwise
   */
  async upsert(conflictColumns = [this.pk], ruleSet = undefined, trx = null) {
    let record = this._applyRuleSet(this.row, ruleSet);

    const client = this.client;

    // native support
    if (["pg", "sqlite3", "mysql2"].includes(client)) {
      let query = this.query(trx)
        .insert(record)
        .onConflict(conflictColumns)
        .merge();

      if (this._supportsReturning()) {
        query = query.returning("*");
      }

      const result = await query;

      let output;

      if (this._supportsReturning()) {
        output = Array.isArray(result) ? result[0] : result;
      } else {
        const id = result[0];
        output = await this.findById(id, trx);
      }

      this.row = { ...output };
      this._isNew = false;

      return this.row;
    }

    // fallback (mssql/oracle)
    const exists = await this.exists(
      { [conflictColumns[0]]: record[conflictColumns[0]] },
      trx
    );

    if (exists) {
      return this.update(record, undefined, trx);
    } else {
      return this.insert(undefined, trx);
    }
  }
}

module.exports = RowDataGateway;
