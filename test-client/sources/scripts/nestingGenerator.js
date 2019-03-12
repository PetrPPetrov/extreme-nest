// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

'use strict';

import * as _ from 'underscore'

function Rectangle(width, height, yPosition, xPosition) {
    this.width = width;
    this.height = height;
    this.yPosition = yPosition;
    this.xPosition = xPosition;
}

function divideRectangle(rectangle, countParts, geometry){
    if (countParts === 0) {
        return;
    }
    if (countParts === 1) {
        geometry.push(rectangle);
        return;
    }

    const leftCountParts = Math.floor(countParts / 2);
    const rightCountParts = countParts - leftCountParts;
    let newWidth = rectangle.width;
    let newHeight = rectangle.height;
    if (rectangle.width > rectangle.height)
    {
        newWidth /= 2;
        divideRectangle(new Rectangle(newWidth, newHeight, rectangle.yPosition, rectangle.xPosition), leftCountParts, geometry);
        divideRectangle(new Rectangle(newWidth, newHeight, rectangle.yPosition, rectangle.xPosition + newWidth), rightCountParts, geometry);
    }
    else
    {
        newHeight /= 2;
        divideRectangle(new Rectangle(newWidth, newHeight, rectangle.yPosition, rectangle.xPosition), leftCountParts, geometry);
        divideRectangle(new Rectangle(newWidth, newHeight, rectangle.yPosition + newHeight, rectangle.xPosition), rightCountParts, geometry);
    }
}

function createRectangleGeometry(rectangleWidth, rectangleHeight) {
    return [[
        [0, 0],
        [rectangleWidth, 0],
        [rectangleWidth, rectangleHeight],
        [0, rectangleHeight]
    ]]
}

async function generateNestingAsync(countFigures, sheetWidth, sheetHeight, nestingTime) {
    const nestingRequest = {};
    nestingRequest.parts = [];
    nestingRequest.sheets = [];
    nestingRequest.time = nestingTime;

    const nestingResponse = {};
    nestingResponse.message = 'successfully completed';
    nestingResponse.nestings = [];

    const sheetID = 55; // TODO: need to generate id
    nestingRequest.sheets.push({
        'height': sheetHeight,
        'length': sheetWidth,
        'id': sheetID
    });
    nestingResponse.nestings.push({
        'sheet': sheetID,
        'nested_parts': [],
        'quantity': 1,
        'length': sheetWidth,
        'height': sheetHeight
    });

    const rectangles = [];
    const rootRectangle = new Rectangle(sheetWidth, sheetHeight, 0, 0);
    divideRectangle(rootRectangle, countFigures, rectangles);

    let figureID = 1;
    let nestedParts = nestingResponse.nestings[0].nested_parts;
    rectangles.forEach(rectangle => {
        const geometry = createRectangleGeometry(rectangle.width, rectangle.height);
        const index = _.findIndex(nestingRequest.parts, part => _.isEqual(part.geometry, geometry));
        if (index !== -1) {
            nestingRequest.parts[index].instances[0].quantity++;
            const nestingPartID = nestingRequest.parts[index].instances[0].id;
            addNestingPart(nestedParts, nestingPartID, [rectangle.xPosition, rectangle.yPosition]);
        } else {
            addNestingGeometry(nestingRequest.parts, figureID, geometry);
            addNestingPart(nestedParts, figureID, [rectangle.xPosition, rectangle.yPosition]);
        }
        figureID++;
    });

    return [ nestingRequest, nestingResponse ];
}

function addNestingGeometry(nestedParts, figureID, geometry) {
    nestedParts.push({
        'geometry': geometry,
        'instances': [{
            'quantity': 1,
            'id': figureID
        }]
    });
}

function addNestingPart(nestedParts, id, [xPos, yPos]) {
    nestedParts.push({
        'id': id,
        'angle': 0,
        'flip': false,
        'position': [xPos, yPos]
    });
}

export default generateNestingAsync