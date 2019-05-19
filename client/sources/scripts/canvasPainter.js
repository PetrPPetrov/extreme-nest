// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

const functional = require('./functionalUtils');
const requestParser = require('../../../common/nestingRequestParser');
const responseParser = require('../../../common/nestingResponseParser');

const blockSize = 20;

module.exports.draw = (canvas, storage) => {
    const openedSheetID = storage.getters.openedSheetNumber;
    const nestingRequest = storage.getters.nestingRequest;
    const nestingResponse = storage.getters.nestingResponse;
    const sheet = requestParser.getSheetById(nestingRequest, openedSheetID);
    drawSheetBorder(canvas, sheet.length * blockSize, sheet.height * blockSize);

    const nesting = responseParser.getNestingBySheetId(nestingResponse, openedSheetID);
    nesting.nested_parts.forEach(part => {
        const instanceID = part.id;
        const rotationAngle = part.angle;
        const position = part.position;
        const xPos = position[0];
        const yPos = position[1];

        // Adding figures
        const geometry = requestParser.getGeometryById(nestingRequest, instanceID);
        functional.doIf(geometry, () => {
            const color = generateColor();
            canvas.add(createLocalCoordinateSystem(position, rotationAngle, color)); // Adding local coordinate system for figure
            geometry.geometry.forEach(vertices => {
                const [xAlignment, yAlignment] = getAlignment(vertices, rotationAngle);
                canvas.add(new fabric.Path(createCoordinates(vertices), {
                    top: yPos * blockSize + (yAlignment * blockSize),
                    left: xPos * blockSize + (xAlignment * blockSize),
                    angle: rotationAngle,
                    fill: color
                }))
            });
        });

        // Adding holes of figures
        const holes = requestParser.getHolesById(nestingRequest, instanceID);
        functional.doIf(holes, () =>
            holes.holes.forEach(vertices =>
                canvas.add(new fabric.Path(createCoordinates(vertices, blockSize), {
                    top: yPos * blockSize,
                    left: xPos * blockSize,
                    angle: rotationAngle,
                    fill: '#FFFFFF'
                }))
            )
        );
    });

    canvas.renderAll();
};

function getAlignment(vertices, angle) {
    let maxXAlignment = 0.0;
    let maxYAlignment = 0.0;
    vertices.forEach(vertex => {
        if (parseFloat(vertex[0]) < maxXAlignment) {
            maxXAlignment = vertex[0];
        }
        if (parseFloat(vertex[1]) < maxYAlignment) {
            maxYAlignment = vertex[1];
        }
    });

    if (angle === 180) {
        return [-maxXAlignment, -maxYAlignment]
    } else {
        return [maxXAlignment, maxYAlignment]
    }
}

function drawSheetBorder(canvas, width, height) {
    const borderCoordinates = `M 0 0 L 0 ${height} L ${width} ${height} L ${width} 0 L 0 0`;
    const path = new fabric.Path(borderCoordinates);
    path.set({ fill: 'white', stroke: 'black' });
    canvas.add(path);
}

function createCoordinates(vertices){
    let coordinates = '';
    coordinates += `M 0 0 L 0 0 M ${vertices[0][0] * blockSize} ${vertices[0][1] * blockSize}`;
    vertices.forEach(vertex => coordinates += ` L ${vertex[0] * blockSize} ${vertex[1] * blockSize}`);
    return coordinates + 'z';
}

function createLocalCoordinateSystem(vertex, angle, color) {
    let coordinates = '';
    coordinates += ` M 0 0 L ${blockSize} 0`;
    coordinates += ` M 0 0 L 0 ${blockSize}`;
    return new fabric.Path(coordinates, {
        strokeDashArray: [2, 2],
        stroke: color,
        top: vertex[1] * blockSize,
        left: vertex[0] * blockSize,
        angle: angle
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