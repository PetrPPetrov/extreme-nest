// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

'use strict';

import * as _ from 'underscore'
import converter from 'xml-js'

const convertToJSONNestingRequest = function (xmlNestingRequest) {
    const jsonText = converter.xml2json(xmlNestingRequest, {compact: true, spaces: 4});
    const jsonRequest = JSON.parse(jsonText);

    const jsonProblem = jsonRequest.nesting.problem;
    const boardComponentAttrs = jsonProblem.boards.piece.component._attributes;
    const sheetComponent = {
        polygonID: boardComponentAttrs.idPolygon,
        type: boardComponentAttrs.type,
        xOffset: boardComponentAttrs.xOffset,
        yOffset: boardComponentAttrs.yOffset
    };

    let pieces = [];
    let uniquePieceID = 1;
    jsonProblem.lot.piece.forEach(piece => {
        const quantity = piece._attributes.quantity;
        const pieceComponentAttrs = piece.component._attributes;
        for (let i = 0; i < quantity; i++) {
            pieces.push({
                id: uniquePieceID++,
                polygonID: pieceComponentAttrs.idPolygon,
                type: pieceComponentAttrs.type,
                xOffset: pieceComponentAttrs.xOffset,
                yOffset: pieceComponentAttrs.yOffset
            });
        }
    });

    let polygons = [];
    jsonRequest.nesting.polygons.polygon.forEach(polygon => {
        const polygonAttrs = polygon._attributes;
        const polygonID = polygonAttrs.id;
        if (polygonID.startsWith('polygon')){
            const countVertices = polygonAttrs.nVertices;
            const lines = polygon.lines.segment.map(segment => ({
                x0: segment._attributes.x0,
                y0: segment._attributes.y0,
                x1: segment._attributes.x1,
                y1: segment._attributes.y1
            }));
            polygons.push({
                polygonID: polygonID,
                countVertices: countVertices,
                lines: lines
            });
        }
    });

    return convertToPowerNestAPI(sheetComponent, pieces, polygons);
};

function convertToPowerNestAPI(sheetComponent, pieces, polygons) {
    const nestingRequest = {};
    nestingRequest.parts = [];
    nestingRequest.sheets = [];
    nestingRequest.time = 5.0; // TODO

    const polygon = _.find(polygons, polygon => polygon.polygonID === sheetComponent.polygonID);
    const polygonLines = polygon.lines;
    nestingRequest.sheets.push({
        length: (polygonLines[0].x1 - polygonLines[0].x0),
        height: (polygonLines[1].y1 - polygonLines[1].y0)
    });

    pieces.forEach(piece => {
        const polygon = _.find(polygons, polygon => polygon.polygonID === piece.polygonID);
        let geometry = [];
        polygon.lines.forEach(line => {
            geometry.push([ line.x0, line.y0 ]);
            geometry.push([ line.x1, line.y1 ]);
        });
        nestingRequest.parts.push({
            geometry: [geometry],
            instances: [{
                id: piece.id,
                quantity: 1
            }]
        });
    });

    return nestingRequest;
}

export default convertToJSONNestingRequest