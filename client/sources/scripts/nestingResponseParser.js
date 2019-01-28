// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

module.exports.getNestingBySheetId = (nestingResponse, id) => {
    return nestingResponse.nestings.find((nesting) => {
        if (nesting.sheet === id) {
            return nesting;
        }
    });
};
