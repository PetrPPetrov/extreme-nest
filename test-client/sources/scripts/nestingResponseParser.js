// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

'use strict';

const functional = require('./functionalUtils');

module.exports.getNestingBySheetId = (nestingResponse, id) => nestingResponse.nestings.find(nesting => functional.doIf(nesting.sheet === id, () => nesting));
