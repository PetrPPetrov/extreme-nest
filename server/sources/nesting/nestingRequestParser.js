// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

const limits = require('../../resources/limits');

// Necessary components for
// nesting optimization
const requiredComponents = [
    {
        nameComponent : 'parts',
        requiredAttributes : [
            'geometry',
            'instances'
        ]
    },
    {
        nameComponent : 'sheets',
        requiredAttributes : [
            'length',
            'height',
            'id'
        ]
    },
    {
        nameComponent : 'time',
        requiredAttributes : []
    }
];

module.exports.isValidNestingRequest = (nestingRequest) => {
    // Check limits of request from resources/limits
    if (!isValidPartsLimit(nestingRequest)){
        return false;
    }

    // Check time limit from resources/limits
    if (!isValidTimeLimit(nestingRequest)) {
        return false;
    }

    // Check required components on exists
    for (const requiredComponent of requiredComponents) {
        if (!(requiredComponent.nameComponent in nestingRequest)){
            return false;
        }

        // Check required attributes in current component on exists
        for (const requiredAttribute of requiredComponent.requiredAttributes) {
            const nestingAttributes = nestingRequest[requiredComponent.nameComponent];
            for (const nestingAttribute of nestingAttributes) {
                if (!(requiredAttribute in nestingAttribute)) {
                    return false;
                }
            }
        }
    }

    return true;
};

function isValidPartsLimit(nestingRequest) {
    // Check on existing parts element
    const componentName = 'parts';
    if (!(componentName in nestingRequest)){
        return false;
    }

    // Check on total number all the parts
    const parts = nestingRequest[componentName];
    if (parts.length > limits.maxTotalNumberParts) {
        return false;
    }

    // Check on number unique components in the parts
    return parts.filter(function(value, i, array) {
        return array.indexOf(value) === i;
    }).length <= limits.maxNumberDifferentParts;
}

function isValidTimeLimit(nestingRequest) {
    // Check on existing time element
    const componentName = 'time';
    if (!(componentName in nestingRequest)){
        return false;
    }

    // Check on time limit
    const time = nestingRequest[componentName];
    return time <= limits.maxOptimizationTime;
}

module.exports.parseNestingRequest = (nestingRequest) => {
    return true; // TODO: need to add parsing of request
};