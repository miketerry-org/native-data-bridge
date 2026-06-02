// database-Server.js:

"use strict";

const KnexDatabase = require(".database-knex");

class ServerDatabase extends KnexDatabase {
  constructor(config) {
    super(config);
  }
}

module.exports = ServerDatabase;
