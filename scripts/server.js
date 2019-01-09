// Copyright (c) 2018 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Gkm-World project.
// This software is intellectual property of GkmSoft.

const express = require('express');
const log4js = require('log4js');

const serverConfig = require('../configuration/serverConfig');
const authentification = require('./handlers/auethentification');

const server = express();
server.get('/authentification', (request, response) => {
    authentification.onAuethentificationRequest(request, response);
});

server.listen(serverConfig.port, () => {
    const log = log4js.getLogger();
    log.info('Server was started successfuly');
    log.info('Server is listening port ' + serverConfig.port + ' ...');
});