// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const databaseConnector = require('../databaseConnector');

const testingDAO = require('../dao/testingsDAO');
const nestingDAO = require('../dao/testsDAO');

const ResponseSender = require('../responseSender');

const log4js = require('log4js');
const log = log4js.getLogger(__filename);
log.level = 'trace';

module.exports = {

    onDeletingTesting: (request, response) => {
        log.trace('Request on: testing deleting');
        const sender = new ResponseSender(response);
        databaseConnector.connect()
            .then(connection => testingDAO.removeByID(databaseConnector.getDatabase(connection), request.params.id))
            .then(() => sender.sendOK({ result: true }))
            .catch(() => sender.sendBadRequest({ result: false }))
    }

};
