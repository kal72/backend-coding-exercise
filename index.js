'use strict';

const port = 8010;

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

const buildSchemas = require('./src/schemas');
const buildAsync = require('./src/lib/dbasync');
const logger = require('./src/config/logger')

db.serialize(() => {
    buildSchemas(db);
    buildAsync(db);

    const app = require('./src/app')(db);

    app.listen(port, () => logger.info(`App started and listening on port ${port}`));
});