// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

'use strict'

const isValidJSONText = (jsonText) => {
    try {
        JSON.parse(jsonText);
    } catch (error) {
        return false;
    }
    return true;
};

export default isValidJSONText