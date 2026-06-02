// database-client.js:

"use strict";

const KnexDatabase = require(".database-knex");

class ClientDatabase extends KnexDatabase {
  constructor(config) {
    super(config);
  }
}

module.exports = ClientDatabase;
