// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const nestingDAO = require('../dao/testsDAO');
const databaseConnector = require('../databaseConnector');

const testingService = require('../services/testing/testingService');

const ResponseSender = require('../responseSender');

const log4js = require('log4js');
const log = log4js.getLogger(__filename);
log.level = 'trace';

module.exports = {

    onTestingCreation: (request, response) => {
        log.trace('Request on: testing creation');
        const sender = new ResponseSender(response);
        testingService.createNewTesting()
            .then(testing => sender.sendCreated(testing))
            .catch(error => sender.sendBadRequest(error))
    }

};
