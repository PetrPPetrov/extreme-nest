// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const MongoClient = require("mongodb").MongoClient;
const configuration = require('../resources/configuration');

const databaseAddress = `${configuration.databaseAddress}:${configuration.databasePort}`;

const log4js = require('log4js');
const log = log4js.getLogger(__filename);
log.level = 'debug';

module.exports = {

    connect : (onConnection) => MongoClient.connect(databaseAddress, { useNewUrlParser: true }, onConnection)
        .catch(error => {
            log.fatal(`Connection with database was not set. Cause: ${error}`);
            process.exit(2);
        }),

    getDatabase : (connection) => connection.db(configuration.databaseName)

};
