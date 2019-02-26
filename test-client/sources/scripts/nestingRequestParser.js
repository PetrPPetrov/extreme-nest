// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

'use strict'

const functional = require('./functionalUtils');

module.exports = {
    getAllSheetsId : nestingRequest => nestingRequest.sheets.map(sheet => sheet.id),
    getSheetById : (nestingRequest, id) => nestingRequest.sheets.find(sheet => functional.doIf(sheet.id === id, () => sheet)),
    getGeometryById : (nestingRequest, id) => nestingRequest.parts.find(part => functional.doIf(isExistInstanceInPartWithId(part, id), () => part.geometry)),
    getHolesById : (nestingRequest, id) => nestingRequest.parts.find(part => functional.doIf(isExistInstanceInPartWithId(part, id), () => part.holes))
};

function isExistInstanceInPartWithId(part, id) {
    return part.instances.find(instance => functional.doIf(instance.id === id, () => true));
}