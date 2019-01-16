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

module.exports.onFullRequest = (request, response) => {
    // TODO: will need to add request handling
    log.debug('Request was came to the fetching handler');
    response
        .status(httpStatusCodes.OK)
        .set({'Content-Type': 'application/json; charset=utf-8'})
        .send({
            "message": "Successfully completed.",
            "nestings": [
                {
                    "length": 1.0,
                    "sheet": 123,
                    "nested_parts": [
                        {
                            "id": 42,
                            "position": [0.0, 0.0],
                            "angle": 0.0,
                            "flip": false
                        }
                    ],
                    "quantity": 1
                }
            ]
        });
};

module.exports.onImageRequest = (request, response) => {
    log.debug('Request was came to the fetching handler');
    const fileName = path.join(__dirname, '..', '..', 'images', request.params.id + '.png');
    if (!filesystem.isFileExistsSync(fileName)) {
        log.debug("Nesting order not found.");
        sendErrorAbsenceNestingOrder(response);
        return;
    }

    const fileSize = filesystem.getFileSizeSync(fileName);
    log.debug(fileSize);
    if (fileSize > limits.maxContentSize) {
        log.debug("Nesting order is too big.");
        sendErrorSizeLimit(response);
        return;
    }

    filesystem
        .readFileAsync(fileName)
        .then((data) => {
            log.debug("Nesting order was sent.");
            sendNestingOrder(response, data);
        }).catch((error) => {
            log.debug("Nesting order was not read. Cause: " + error);
            sendErrorAbsenceNestingOrder(response);
        });
};

function sendNestingOrder(response, data) {
    response
        .status(httpStatusCodes.OK)
        .set({'Content-Type': 'image/png'})
        .send(data);
}

function sendErrorAbsenceNestingOrder(response){
    response
        .status(httpStatusCodes.NOT_FOUND)
        .set({'Content-Type': 'application/json; charset=utf-8'})
        .send({
            "message" : "This nesting order does not exist"
        });
}

function sendErrorSizeLimit(response){
    response
        .status(httpStatusCodes.BAD_REQUEST)
        .set({'Content-Type': 'application/json; charset=utf-8'})
        .send({
            "message" : "This nesting is too big."
        });
}
