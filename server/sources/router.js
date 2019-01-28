// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const nestingHandler = require('./handlers/nestingHandler');
const fetchingHandler = require('./handlers/fetchingHandler');
const fullResultHandler = require('./handlers/fullResultHandler');
const partialResultHandler = require('./handlers/partialResultHandler');
const httpStatusCodes = require('./httpStatusCodes');

module.exports.route = (server) => {
    server.post('/new', (request, response) => nestingHandler.onNestingRequest(request, response));
    server.get('/result/:id/stats', (request, response) => partialResultHandler.onPartialRequest(request, response));
    server.get('/result/:id/image', (request, response) => fetchingHandler.onImageRequest(request, response));
    server.get('/result/:id/full', (request, response) => fullResultHandler.onFullRequest(request, response));
    server.get('*', (request, response) => {
            response
                .status(httpStatusCodes.BAD_REQUEST)
                .set({'Content-Type': 'application/json; charset=utf-8'})
                .send({
                    message: 'Unknown HTTP request'
                });
        }
    );
};
