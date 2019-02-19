// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

const functional = require('./functionalUtils');
const requestParser = require('./nestingRequestParser');
const responseParser = require('./nestingResponseParser');

module.exports.draw = (canvas, sheetID, jsonNestingRequest, jsonNestingResponse) => {
    const blockSize = 20;
    const sheet = requestParser.getSheetById(jsonNestingRequest, sheetID);
    drawSheetBorder(canvas, sheet.length * blockSize, sheet.height * blockSize);
    const nesting = responseParser.getNestingBySheetId(jsonNestingResponse, sheetID);
    nesting.nested_parts.forEach((part) => {
        const geometry = requestParser.getGeometryById(jsonNestingRequest, part.id);
        functional.doIf(geometry, () => {
            const color = generateColor(part.position[0], part.position[1]);
            canvas.add(createLocalCoordinateSystem(part.position, part.angle, blockSize, color));
            geometry.geometry.forEach((vertices) => {
                canvas.add(new fabric.Path(createCoordinates(vertices, blockSize), {
                    top: (part.position[1]) * blockSize,
                    left: (part.position[0]) * blockSize,
                    angle: part.angle,
                    fill: color
                }));
            })
        });

        const holes = requestParser.getHolesById(jsonNestingRequest, part.id);
        functional.doIf(holes, () =>
            holes.holes.forEach((vertices) => {
                canvas.add(new fabric.Path(createCoordinates(vertices, blockSize), {
                    top: part.position[1] * blockSize,
                    left: part.position[0] * blockSize,
                    angle: part.angle,
                    fill: '#FFFFFF'
                }));
            })
        );
    });
    canvas.renderAll();
};

function drawSheetBorder(canvas, width, height) {
    const borderCoordinates = `M 0 0 L 0 ${height} L ${width} ${height} L ${width} 0 L 0 0`;
    const path = new fabric.Path(borderCoordinates);
    path.set({ fill: 'white', stroke: 'black' });
    canvas.add(path);
}

function createCoordinates(vertices, blockSize){
    let coordinates = '';
    coordinates += `M 0 0 L 0 0 M ${vertices[0][0] * blockSize} ${vertices[0][1] * blockSize}`;
    vertices.forEach((vertex) => {
        coordinates += ` L ${vertex[0] * blockSize} ${vertex[1] * blockSize}`;
    });
    return coordinates + 'z';
}

function createLocalCoordinateSystem(vertex, angle, blockSize, color) {
    let coordinates = '';
    coordinates += ` M 0 0 L ${1 * blockSize} 0`;
    coordinates += ` M 0 0 L 0 ${1 * blockSize}`;
    return new fabric.Path(coordinates, {
        strokeDashArray: [2, 2],
        stroke: color,
        top: vertex[1] * blockSize,
        left: vertex[0] * blockSize,
        angle: angle
    });
}

function generateColor(xPos, yPos) {
    const x = ((xPos + 17) * 23).toString(16).padStart(3, 0);
    const y = ((yPos + 13) * 31).toString(16).padStart(3, 0);
    return `#${x}${y}`.slice(0, 7);
}
