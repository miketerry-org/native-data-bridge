// transport-server.js

"use strict";

const express = require("express");
const knex = require("knex");
const AbstractTransport = require("./transport-abstract");

class ServerTransport extends AbstractTransport {
  constructor(config = {}) {
    super(config);

    if (!config.knex) {
      throw new Error("ServerTransport requires a knex config");
    }

    this._knex = knex(config.knex);

    this._app = express();
    this._server = null;

    this._port = config.port || 3000;
    this._basePath = config.basePath || "/api";
    this._idField = config.idField || "id";

    this._setupMiddleware();
    this._setupRoutes();
  }

  // -----------------------------
  // REQUIRED ABSTRACT METHOD
  // -----------------------------
  async request() {
    this.notImplemented("request");
  }

  // -----------------------------
  // LIFECYCLE
  // -----------------------------
  async connect() {
    if (this._server) return this._server;

    return new Promise((resolve) => {
      this._server = this._app.listen(this._port, () => {
        resolve(this._server);
      });
    });
  }

  async disconnect() {
    if (!this._server) return;

    return new Promise((resolve, reject) => {
      this._server.close((err) => {
        if (err) return reject(err);
        this._server = null;
        resolve();
      });
    });
  }

  get connected() {
    return !!this._server;
  }

  // -----------------------------
  // EXPRESS SETUP
  // -----------------------------
  _setupMiddleware() {
    this._app.use(express.json());
  }

  _setupRoutes() {
    const base = this._basePath;

    this._app.get(`${base}/:table`, async (req, res) => {
      try {
        const result = await this.read(req.params.table, { params: req.query });

        res.json(result);
      } catch (err) {
        this._handleError(res, err);
      }
    });

    this._app.post(`${base}/:table`, async (req, res) => {
      try {
        const result = await this.create(req.params.table, req.body);

        res.json(result);
      } catch (err) {
        this._handleError(res, err);
      }
    });

    this._app.put(`${base}/:table`, async (req, res) => {
      try {
        const result = await this.update(req.params.table, req.body, {
          params: req.query,
        });

        res.json(result);
      } catch (err) {
        this._handleError(res, err);
      }
    });

    this._app.patch(`${base}/:table`, async (req, res) => {
      try {
        const result = await this.update(req.params.table, req.body, {
          params: req.query,
        });

        res.json(result);
      } catch (err) {
        this._handleError(res, err);
      }
    });

    this._app.delete(`${base}/:table`, async (req, res) => {
      try {
        const result = await this.remove(req.params.table, {
          params: req.query,
        });

        res.json({
          deleted: result,
        });
      } catch (err) {
        this._handleError(res, err);
      }
    });
  }

  // -----------------------------
  // CORE TRANSPORT METHODS (Knex-backed)
  // -----------------------------

  _table(table) {
    return this._knex(table);
  }

  _applyWhere(query, params = {}) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      query.where(key, value);
    }
    return query;
  }

  // READ
  async get(table, options = {}) {
    let query = this._table(table);

    if (options.params) {
      query = this._applyWhere(query, options.params);
    }

    if (options.limit) query.limit(options.limit);
    if (options.offset) query.offset(options.offset);
    if (options.orderBy) query.orderBy(options.orderBy);

    return query;
  }

  async read(table, options = {}) {
    return this.get(table, options);
  }

  // CREATE
  async post(table, data = {}, options = {}) {
    const result = await this._table(table).insert(data).returning("*");

    return Array.isArray(result) ? result[0] : result;
  }

  async create(table, data = {}, options = {}) {
    return this.post(table, data, options);
  }

  // UPDATE
  async put(table, data = {}, options = {}) {
    if (!options.params) {
      throw new Error("UPDATE requires params (WHERE clause)");
    }

    const query = this._applyWhere(this._table(table), options.params);

    const result = await query.update(data).returning("*");

    return result;
  }

  async update(table, data = {}, options = {}) {
    return this.put(table, data, options);
  }

  async patch(table, data = {}, options = {}) {
    return this.put(table, data, options);
  }

  // DELETE
  async delete(table, options = {}) {
    if (!options.params) {
      throw new Error("DELETE requires params (WHERE clause)");
    }

    const query = this._applyWhere(this._table(table), options.params);

    return query.del();
  }

  async remove(table, options = {}) {
    return this.delete(table, options);
  }

  // -----------------------------
  // ERROR HANDLING
  // -----------------------------
  _handleError(res, err) {
    res.status(err.status || 500).json({
      error: err.message,
      status: err.status || 500,
    });
  }
}

module.exports = ServerTransport;
