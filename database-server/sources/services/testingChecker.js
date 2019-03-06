// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const _ = require('underscore');

const log4js = require('log4js');
const log = log4js.getLogger(__filename);
log.level = 'debug';

const FAILED_RESULT = 'failed';
const SUCCESS_RESULT = 'success';

module.exports.checkTest = (test) => {
    if (_.isEmpty(test.serverResponse)) {
        log.debug(`Test with ID: ${test.id} was failed. Cause: empty response from nesting server.`);
        return FAILED_RESULT;
    }

    if (!isValidDimensions(test.goldResponse, test.serverResponse)) {
        log.debug(`Test with ID: ${test.id} was failed. Cause: invalid dimensions.`);
        return FAILED_RESULT;
    } else if (!isEqualSheets(test.goldResponse, test.serverResponse)){
        log.debug(`Test with ID: ${test.id} was failed. Cause: sheets are not equal.`);
        return FAILED_RESULT;
    } else {
        log.debug(`Test with ID: ${test.id} is success`);
        return SUCCESS_RESULT;
    }
};

function isValidDimensions(goldResponse, serverResponse) {
    const goldResponseHeight = _.first(goldResponse.nestings).height;
    const goldResponseLength = _.first(goldResponse.nestings).length;
    const serverResponseHeight = _.first(serverResponse.nestings).height;
    const serverResponseLength = _.first(serverResponse.nestings).length;
    const availableHeightDifference = goldResponseHeight / 100 * 5;
    const availableLengthDifference = goldResponseLength / 100 * 5;
    return !( (goldResponseHeight + availableHeightDifference < serverResponseHeight) ||
              (goldResponseLength + availableLengthDifference < serverResponseLength) );
}

function isEqualSheets(goldResponse, serverResponse) {
    const goldResponseSheets = goldResponse.nestings.map(nesting => nesting.sheet);
    if (_.isEmpty(goldResponseSheets)) {
        return false;
    }
    const serverResponseSheets = serverResponse.nestings.map(nesting => nesting.sheet);
    if (_.isEmpty(serverResponseSheets)) {
        return false;
    }
    return JSON.stringify(goldResponseSheets) === JSON.stringify(serverResponseSheets);
}