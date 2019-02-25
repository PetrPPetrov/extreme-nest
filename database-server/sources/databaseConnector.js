// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const MongoClient = require("mongodb").MongoClient;
const configuration = require('../resources/configuration');

const connect = (onConnection) => MongoClient.connect(`${configuration.databaseAddress}:${configuration.databasePort}`, { useNewUrlParser: true }, onConnection);
const getDatabase = (client) => client.db(configuration.databaseName);

module.exports.connect = connect;
module.exports.getDatabase = getDatabase;