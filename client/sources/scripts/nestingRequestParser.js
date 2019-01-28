// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

module.exports.getAllSheetsId = (nestingRequest) => {
    return nestingRequest.sheets.map((sheet) => {
        return sheet.id;
    });
};

module.exports.getSheetById = (nestingRequest, id) => {
    return nestingRequest.sheets.find((sheet) => {
        if (sheet.id === id) {
            return sheet;
        }
    });
};

module.exports.getGeometryById = (nestingRequest, id) => {
    return nestingRequest.parts.find((part) => {
        if (isExistInstanceInPartWithId(part, id)) {
            return part.geometry;
        }
    });
};

function isExistInstanceInPartWithId(part, id) {
    return part.instances.find((instance) => {
        if (instance.id === id) {
            return true;
        }
    });
}