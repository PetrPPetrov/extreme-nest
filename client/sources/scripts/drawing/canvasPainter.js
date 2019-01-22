//import configuration from '../../resources/data/configuration'

module.exports.drawNestingOptimizationSheet = (canvas, context, sheetID, jsonNestingRequest, jsonNestingResponse) => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.lineWidth = 0;//configuration.canvasLineWidth;

    const sheet = getSheetById(jsonNestingRequest, sheetID);
    const blockHeight = canvas.height / sheet.height;
    const blockWidth = canvas.width / sheet.length;

    const nesting = getNestingBySheetId(jsonNestingResponse, sheetID);
    nesting.nested_parts.forEach((part) => {
        const xPartPosition = part.position[0];
        const yPartPosition = part.position[1];
        context.moveTo(xPartPosition * blockWidth, yPartPosition * blockHeight);
        const color = getRandomColor();
        context.strokeStyle = color;
        context.fillStyle = color;
        context.beginPath();
        const geometry = getGeometryById(jsonNestingRequest, part.id);
        geometry.geometry.forEach((vertices) => {
            vertices.forEach((vertex) => {
                if (part.angle !== 0) {
                    rotateVertex(vertex, part.angle);
                }
                const xVertexPosition = vertex[0];
                const yVertexPosition = vertex[1];
                context.lineTo(
                    (xVertexPosition * blockWidth) + xPartPosition,
                    (yVertexPosition * blockHeight) + yPartPosition
                );
            });
        });
        context.fill();
        context.closePath();
    });
};

function getSheetById(nestingRequest, id) {
    return nestingRequest.sheets.find((sheet) => {
        if (sheet.id === id) {
            return sheet;
        }
    });
}

function getGeometryById(nestingRequest, id) {
    return nestingRequest.parts.find((part) => {
        if (isExistInstanceInPartWithId(part, id)) {
            return part.geometry;
        }
    });
}

function isExistInstanceInPartWithId(part, id) {
    return part.instances.find((instance) => {
        if (instance.id === id) {
            return true;
        }
    });
}

function getNestingBySheetId(nestingResponse, id) {
    return nestingResponse.nestings.find((nesting) => {
        if (nesting.sheet === id) {
            return nesting;
        }
    });
}

function rotateVertex(vertex, angle) {
    vertex[0] = vertex[0] * Math.cos(angle) - vertex[1] * Math.sin(angle);
    vertex[1] = vertex[0] * Math.sin(angle) + vertex[1] * Math.cos(angle);
}

function getRandomColor() {
    const letters = '0123456789ABCDE';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 15)];
    }
    return color;
}
