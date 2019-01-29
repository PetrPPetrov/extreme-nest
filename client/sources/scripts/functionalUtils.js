// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

module.exports.doIf = (condition, callback) => {
    if (condition) {
        callback();
    }
};

module.exports.doElse = (condition, callback) => {
    if (!condition) {
        callback();
    }
};

module.exports.doIfElse = (condition, trueCallback, falseCallback) => {
    if (condition) {
        trueCallback();
    } else {
        falseCallback();
    }
};