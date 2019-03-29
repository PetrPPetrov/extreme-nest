// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

'use strict';

import * as _ from 'underscore'

const FIGURE_TYPE_TRIANGLE = 1;
const FIGURE_TYPE_RECTANGLE = 2;

const TRIANGLE_UP_DIRECTION = 1;
const TRIANGLE_DOWN_DIRECTION = 2;

function Figure(type, width, height, yPosition, xPosition) {
    this.type = type;
    this.width = width;
    this.height = height;
    this.yPosition = yPosition;
    this.xPosition = xPosition;
}

function Triangle(width, height, yPosition, xPosition, direction) {
    Figure.call(this, FIGURE_TYPE_TRIANGLE, width, height, yPosition, xPosition);
    this.direction = direction;
}

function Rectangle(width, height, yPosition, xPosition) {
    Figure.call(this, FIGURE_TYPE_RECTANGLE, width, height, yPosition, xPosition);
}

Triangle.prototype = Object.create(Figure.prototype);
Rectangle.prototype = Object.create(Figure.prototype);

function divideRectangle(rectangle, countParts, geometry){
    if (countParts === 0) {
        return;
    }
    if ( (countParts === 2) && (_.sample([true, false])) ) {
        geometry.push(new Triangle(rectangle.width, rectangle.height, rectangle.yPosition, rectangle.xPosition, TRIANGLE_UP_DIRECTION));
        geometry.push(new Triangle(rectangle.width, rectangle.height, rectangle.yPosition, rectangle.xPosition, TRIANGLE_DOWN_DIRECTION));
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

function createTriangleGeometry(triangleWidth, triangleHeight, direction) {
    if (direction === TRIANGLE_UP_DIRECTION) {
        return [[
            [0, 0],
            [parseFloat(triangleWidth), 0],
            [parseFloat(triangleWidth), parseFloat(triangleHeight)],
        ]];
    } else {
        return [[
            [0, 0],
            [0, parseFloat(triangleHeight)],
            [parseFloat(triangleWidth), parseFloat(triangleHeight)],
        ]];
    }
}

function createRectangleGeometry(rectangleWidth, rectangleHeight) {
    return [[
        [0, 0],
        [parseFloat(rectangleWidth), 0],
        [parseFloat(rectangleWidth), parseFloat(rectangleHeight)],
        [0, parseFloat(rectangleHeight)]
    ]]
}

async function generateNestingAsync(countFigures, sheetWidth, sheetHeight, nestingTime) {
    const nestingRequest = {};
    nestingRequest.parts = [];
    nestingRequest.sheets = [];
    nestingRequest.time = parseInt(nestingTime);

    const nestingResponse = {};
    nestingResponse.message = 'successfully completed';
    nestingResponse.nestings = [];

    const sheetID = 55; // TODO: need to generate id
    nestingRequest.sheets.push({
        'height': parseFloat(sheetHeight) + 0.001,
        'length': parseFloat(sheetWidth) + 0.001,
        'id': sheetID
    });
    
    nestingResponse.nestings.push({
        'sheet': sheetID,
        'nested_parts': [],
        'quantity': 1,
        'length': sheetWidth,
        'height': sheetHeight
    });

    const figures = [];
    const rootRectangle = new Rectangle(sheetWidth, sheetHeight, 0, 0);
    divideRectangle(rootRectangle, countFigures, figures);

    let figureID = 1;
    let nestedParts = nestingResponse.nestings[0].nested_parts;
    figures.forEach(figure => {
        let geometry = null;
        if (figure.type === FIGURE_TYPE_TRIANGLE) {
            geometry = createTriangleGeometry(figure.width, figure.height, figure.direction);
        } else {
            geometry = createRectangleGeometry(figure.width, figure.height);
        }
        addNestingGeometry(nestingRequest.parts, figureID, geometry, generateColor());
        addNestingPart(nestedParts, figureID, [figure.xPosition, figure.yPosition]);
        figureID++;
    });

    return [ nestingRequest, nestingResponse ];
}

function addNestingGeometry(nestedParts, figureID, geometry, color) {
    nestedParts.push({
        'geometry': geometry,
        'instances': [{
            'quantity': 1,
            'color': color,
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

function generateColor() {
    const hexValues = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e"];
    let newColor = "#";
    for (let i = 0; i < 6; i++ ) {
        newColor += hexValues[Math.round( Math.random() * 14 )];
    }
    return newColor;
}

export default generateNestingAsync