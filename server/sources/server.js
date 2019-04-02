// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const log4js = require('log4js');

const configuration = require('../resources/configuration');
const router = require('./router');

const server = express();
server.use(bodyParser.json({ limit: '10mb' }));
server.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
server.use((request, response, next) => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
    response.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
    next();
});

const log = log4js.getLogger(__filename);
log.level = 'info';

server.listen(configuration.serverPort, configuration.serverAddress, () => {
    router.route(server);
    log.info('Server was started successfully on ' +
        configuration.serverAddress + ':' + configuration.serverPort);
});