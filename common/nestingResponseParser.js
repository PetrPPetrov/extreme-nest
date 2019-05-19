// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

'use strict';

module.exports.getNestingBySheetId = (nestingResponse, id) => nestingResponse.nestings.find(nesting => {
    if (nesting.sheet === id){
        return nesting;
    }
});
