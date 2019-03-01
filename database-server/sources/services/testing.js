// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const nestingDAO = require('../dao/nesting');
const testingDAO = require('../dao/testing');
const goldRequestsDAO = require('../dao/goldRequests');
const goldResponsesDAO = require('../dao/goldResponses');
const serverRequestsDAO = require('../dao/serverRequests');
const databaseConnector = require('../databaseConnector');

const log4js = require('log4js');
const log = log4js.getLogger(__filename);
log.level = 'debug';

module.exports = {

    createNewTesting: async () => {
        const today = new Date();
        const currentDate = `${today.getDate()}.${(today.getMonth()+1)}.${today.getFullYear()}`;
        const currentTime = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
        const connection = await databaseConnector.connect();
        const database = databaseConnector.getDatabase(connection);
        return new Promise(async (resolve, reject) => {
            nestingDAO.getAll(database)
                .then(nestings => testingDAO.create(database, { date: currentDate, time: currentTime, nestings: nestings }))
                .then(newTesting => resolve(newTesting))
                .catch(() => reject({}))
                .finally(() => connection.close())
        });
    }

};