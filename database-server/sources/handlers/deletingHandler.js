// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const databaseConnector = require('../databaseConnector');

const testingDAO = require('../dao/testingsDAO');
const nestingDAO = require('../dao/nestingDAO');

const ResponseSender = require('../responseSender');

const log4js = require('log4js');
const log = log4js.getLogger(__filename);
log.level = 'trace';

module.exports = {

    onDeletingNesting: (request, response) => {
        log.trace('Request on: nesting deleting');
        const sender = new ResponseSender(response);
        databaseConnector.connect()
            .then(connection => {
                const database = databaseConnector.getDatabase(connection);
                nestingDAO.getByIDAsync(request.params.id)
                    .then(nesting => nestingDAO.removeByID(database, request.params.id))
                    .then(() => sender.sendOK({ result : true}))
            })
            .catch(() => sender.sendBadRequest({ result: false }));
    },

    onDeletingTesting: (request, response) => {
        log.trace('Request on: testing deleting');
        const sender = new ResponseSender(response);
        databaseConnector.connect()
            .then(connection => testingDAO.removeByID(databaseConnector.getDatabase(connection), request.params.id))
            .then(() => sender.sendOK({ result: true }))
            .catch(() => sender.sendBadRequest({ result: false }))
    }

};
