// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

'use strict'

module.exports.doIf = (condition, callback) => {
    if (condition) {
        return callback();
    }
};

module.exports.doElse = (condition, callback) => {
    if (!condition) {
        return callback();
    }
};

module.exports.doIfElse = (condition, trueCallback, falseCallback) => {
    if (condition) {
        return trueCallback();
    } else {
        return falseCallback();
    }
};