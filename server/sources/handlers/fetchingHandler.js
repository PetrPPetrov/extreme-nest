// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

const path = require('path');
const log4js = require('log4js');

const limits = require('../../resources/limits');
const filesystem = require('../utils/filesystem');
const httpStatusCodes = require('../httpStatusCodes');

const log = log4js.getLogger(__filename);
log.level = 'debug';

module.exports.onRequest = (request, response) => {
    log.debug('Request was came to the fetching handler');
    const id = request.params.id;
    const fileName = path.join(__dirname, '..', '..', 'images', id + '.png');
    if (!filesystem.isFileExistsSync(fileName)) {
        log.debug("Nesting order not found.");
        response
            .status(httpStatusCodes.NOT_FOUND)
            .send('This nesting order does not exist');
        return;
    }

    const fileSize = filesystem.getFileSizeSync(fileName);
    log.debug(fileSize);
    if (fileSize > limits.maxContentSize) {
        log.debug("Nesting order not found.");
        response
            .status(httpStatusCodes.BAD_REQUEST)
            .send('This nesting is too big.');
        return;
    }

    sendNestingOrder(request, response, fileName);
};

function sendNestingOrder(request, response, fileNameNestingOrder) {
    filesystem
        .readFileAsync(fileNameNestingOrder)
        .then((data) => {
            log.debug("Nesting order was sent.");
            response
                .status(httpStatusCodes.OK)
                .set({'Content-Type': 'image/png'})
                .send(data);
        }).catch((error) => {
        log.debug("Nesting order was not read.");
        response
            .status(httpStatusCodes.NOT_FOUND)
            .send('This nesting order does not exist');
    });
}
