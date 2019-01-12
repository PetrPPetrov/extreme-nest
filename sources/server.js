// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

const express = require('express');
const bodyParser = require('body-parser');
const log4js = require('log4js');

const configuration = require('../resources/configuration');
const router = require('./router');

const server = express();
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));

server.listen(configuration.serverPort, configuration.serverAddress, () => {
    router.route(server);
    const log = log4js.getLogger(__filename);
    log.level = 'info';
    log.info('Server was started successfuly. Address: ' +
        configuration.serverAddress + ':' + configuration.serverPort);
});