// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

'use strict';

module.exports = {

    getAllSheetsId : nestingRequest => nestingRequest.sheets.map(sheet => sheet.id),

    getSheetById : (nestingRequest, id) => nestingRequest.sheets.find(sheet => {
        if (sheet.id === id) {
            return sheet;
        }
    }),

    getGeometryById : (nestingRequest, id) => nestingRequest.parts.find(part => {
        if (isExistInstanceInPartWithId(part, id)) {
            return part.geometry;
        }
    }),

    getHolesById : (nestingRequest, id) => nestingRequest.parts.find(part => {
        if (isExistInstanceInPartWithId(part, id)) {
            return part.holes;
        }
    })

};

function isExistInstanceInPartWithId(part, id) {
    return part.instances.find(instance => {
        if (instance.id === id){
            return true;
        }
    });
}