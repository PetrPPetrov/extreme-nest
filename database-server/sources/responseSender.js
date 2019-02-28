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

ResponseSender.prototype.sendOK = function (data) {
    log.trace(`Response was sent with ${HTTP_STATUS_CODE.OK} status`);
    this.response.status(HTTP_STATUS_CODE.OK).set({'Content-Type': 'application/json; charset=utf-8'}).send(data);
};

ResponseSender.prototype.sendCreated = function (data) {
    log.trace(`Response was sent with ${HTTP_STATUS_CODE.CREATED} status`);
    this.response.status(HTTP_STATUS_CODE.CREATED).set({'Content-Type': 'application/json; charset=utf-8'}).send(data);
};

ResponseSender.prototype.sendBadRequest = function (data) {
    log.trace(`Response was sent with ${HTTP_STATUS_CODE.BAD_REQUEST} status`);
    this.response.status(HTTP_STATUS_CODE.BAD_REQUEST).set({'Content-Type': 'application/json; charset=utf-8'}).send(data);
};

ResponseSender.prototype.sendNotFound = function (data) {
    log.trace(`Response was sent with ${HTTP_STATUS_CODE.NOT_FOUND} status`);
    this.response.status(HTTP_STATUS_CODE.NOT_FOUND).set({'Content-Type': 'application/json; charset=utf-8'}).send(data);
};

module.exports = ResponseSender;
