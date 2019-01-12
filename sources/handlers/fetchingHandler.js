// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

const path = require('path');
const log4js = require('log4js');

const filesystem = require('../utils/filesystem');
const httpStatusCodes = require('../httpStatusCodes');

module.exports.onRequest = (request, response) => {
    const log = log4js.getLogger(__filename);
    log.level = 'debug';
    log.debug('Request was came to the fetching handler');

    const id = request.params.id;
    const fileName = path.join(__dirname, '..', '..', 'images', id + '.png');
    filesystem
        .readFile(fileName)
        .then((data) => {
            log.debug("Nesting order was sent.");
            response
                .status(httpStatusCodes.OK)
                .set({'Content-Type': 'image/png'})
                .send(data);
        }).catch((error) => {
            log.debug("Nesting order not found or was not read.")
            response
                .status(httpStatusCodes.NOT_FOUND)
                .send('This nesting order does not exist');
        });
};