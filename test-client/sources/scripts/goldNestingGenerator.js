// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

'use strict'

import isValidJSONText from './utils'

const generateGoldNestingAsync = async (countFigures, sheetWidth, sheetHeight) => {
    const result = 'Not valid JSON';
    return new Promise((resolve, reject) => {
       if (isValidJSONText(result)) {
           resolve(result);
       } else {
           reject(result);
       }
    });
};

export default generateGoldNestingAsync