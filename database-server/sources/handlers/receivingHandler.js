// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const nestingDAO = require('../dao/testsDAO');
const testingDAO = require('../dao/testingsDAO');
const databaseConnector = require('../databaseConnector');

const ResponseSender = require('../responseSender');

const log4js = require('log4js');
const log = log4js.getLogger(__filename);
log.level = 'trace';

module.exports = {

    onAllTestingReceiving: (request, response) => {
        log.trace('Request on: getting all the testings');
        const sender = new ResponseSender(response);
        databaseConnector.connect()
            .then(connection => testingDAO.getAll(databaseConnector.getDatabase(connection)))
            .then(testings => sender.sendOK(testings))
            .catch(error => sender.sendNotFound(error))
    },

    onTestingReceivingByID: (request, response) => {
        log.trace('Request on: getting testing');
        const sender = new ResponseSender(response);
        databaseConnector.connect()
            .then(connection => testingDAO.getByID(databaseConnector.getDatabase(connection), request.params.id))
            .then(testing => sender.sendOK(testing))
            .catch(error => sender.sendNotFound(error))
    }

};
