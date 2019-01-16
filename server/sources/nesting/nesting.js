// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

const nestingRequestParser = require('./nestingRequestParser');

module.exports.optimizeNesting = (nestingRequest) => {
    const isValidRequest = nestingRequestParser.isValidNestingRequest(nestingRequest);
    if (!isValidRequest) {
        return false;
    }

    const parsedRequest = nestingRequestParser.parseNestingRequest(nestingRequest);
    return 123796256855234; // TODO: will need to change on nesting order
};