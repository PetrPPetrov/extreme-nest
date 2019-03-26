// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const log4js = require('log4js');
const log = log4js.getLogger(__filename);
log.level = 'trace';

const HTTP_STATUS_CODE = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404
};

function ResponseSender(response) {
    this.response = response;
}

ResponseSender.prototype.sendOKSync = function (data) {
    log.trace(`Response was sent with ${HTTP_STATUS_CODE.OK} status`);
    this.response.status(HTTP_STATUS_CODE.OK).json(data);
};

ResponseSender.prototype.sendCreatedSync = function (data) {
    log.trace(`Response was sent with ${HTTP_STATUS_CODE.CREATED} status`);
    this.response.status(HTTP_STATUS_CODE.CREATED).json(data);
};

ResponseSender.prototype.sendBadRequestSync = function (data) {
    log.trace(`Response was sent with ${HTTP_STATUS_CODE.BAD_REQUEST} status`);
    this.response.status(HTTP_STATUS_CODE.BAD_REQUEST).json(data);
};

ResponseSender.prototype.sendNotFoundSync = function (data) {
    log.trace(`Response was sent with ${HTTP_STATUS_CODE.NOT_FOUND} status`);
    this.response.status(HTTP_STATUS_CODE.NOT_FOUND).json(data);
};

module.exports = ResponseSender;
