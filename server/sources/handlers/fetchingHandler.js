// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.
'use strict';

const path = require('path');
const log4js = require('log4js');

const limits = require('../../resources/limits');
const filesystem = require('../utils/filesystem');
const httpStatusCodes = require('../httpStatusCodes');

const log = log4js.getLogger(__filename);
log.level = 'debug';

module.exports.onStatsRequest = (request, response) => {
    log.debug('onStatsRequest(request, response)');
    response
        .status(httpStatusCodes.OK)
        .set({'Content-Type': 'application/json; charset=utf-8'})
        .send(
            {
                message: 'successfully completed',
                nestings: [
                {
                    sheet: 1,
                    nested_parts: [
                        {
                            id: 1,
                        }
                    ],
                    quantity: 3,
                    length: 1.0,
                    height: 1.0
                }]
            });
};

module.exports.onImageRequest = (request, response) => {
    log.debug('onImageRequest(request, response)');
    const fileName = path.join(__dirname, '..', '..', 'images', 'default_preview.png');
    if (!filesystem.isFileExistsSync(fileName)) {
        log.debug('Preview image is not found.');
        sendErrorAbsenceNestingOrder(response);
        return;
    }

    const fileSize = filesystem.getFileSizeSync(fileName);
    log.debug(fileSize);
    if (fileSize > limits.maxContentSize) {
        log.debug('Preview image is too big.');
        sendErrorSizeLimit(response);
        return;
    }

    filesystem
        .readFileAsync(fileName)
        .then((data) => {
            log.debug('Preview image has been sent.');
            sendPreviewImage(response, data);
        }).catch((error) => {
            log.debug('Could not read preview image. Cause: ' + error);
        sendErrorAbsenceNestingOrder(response);
    });
};

function sendPreviewImage(response, data) {
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
            message : 'This nesting order does not exist'
        });
}

function sendErrorSizeLimit(response){
    response
        .status(httpStatusCodes.BAD_REQUEST)
        .set({'Content-Type': 'application/json; charset=utf-8'})
        .send({
            message : 'This nesting is too big'
        });
}
