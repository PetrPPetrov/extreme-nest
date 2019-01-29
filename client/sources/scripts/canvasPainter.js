// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

const functional = require('./functionalUtils');
const requestParser = require('./nestingRequestParser');
const responseParser = require('./nestingResponseParser');

module.exports.drawNestingOptimizationSheet = (canvas, context, sheetID, jsonNestingRequest, jsonNestingResponse, scaling) => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.lineWidth = 0;
    context.save();
    context.transform(1, 0, 0, -1, 0, canvas.height);

    const sheet = requestParser.getSheetById(jsonNestingRequest, sheetID);
    responseParser.getNestingBySheetId(jsonNestingResponse, sheetID).nested_parts.forEach((part) => {
        const geometry = requestParser.getGeometryById(jsonNestingRequest, part.id);
        functional.doIf(geometry !== undefined, () => {
            drawGeometry(context, geometry.geometry, part.angle, generateColor(), {
                scaling: scaling,
                xPartPosition: part.position[0],
                yPartPosition: part.position[1]
            });
        });

        const holes = requestParser.getHolesById(jsonNestingRequest, part.id);
        functional.doIf(holes !== undefined, () =>
            drawGeometry(context, holes.holes, part.angle, '#FFFFFF', {
                scaling: scaling,
                xPartPosition: part.position[0],
                yPartPosition: part.position[1]
            })
        );
    });

    context.restore();
};

function drawGeometry(context, geometry, angle, color, dimension) {
    context.strokeStyle = color;
    context.fillStyle = color;
    context.beginPath();

    geometry.forEach((vertices) => {
        context.save();
        context.translate(
            dimension.xPartPosition * dimension.scaling,
            dimension.yPartPosition * dimension.scaling
        );
        functional.doIf(angle !== 0, () => context.rotate(angle * Math.PI / 180.0));
        context.moveTo(
            vertices[0][0] * dimension.scaling,
            vertices[0][1] * dimension.scaling
        );
        vertices.forEach((vertex) => {
            console.log(vertex);
            context.lineTo(
                vertex[0] * dimension.scaling,
                vertex[1] * dimension.scaling
            );
        });
        context.restore();
    });

    context.fill();
    context.closePath();
}

function generateColor() {
    const letters = '0123456789ABCDE';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 15)];
    }
    return color;
}
