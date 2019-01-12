// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

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
    // Check required components
    for (const requiredComponent of requiredComponents) {
        if (!(requiredComponent.nameComponent in nestingRequest)){
            return false;
        }

        // Check required attributes in current component
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

module.exports.parseNestingRequest = (nestingRequest) => {
    return true; // TODO: need to add prasing of request
};