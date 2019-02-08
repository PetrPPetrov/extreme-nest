// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const log4js = require('log4js');
const ClipperLib = require('./util/clippernode');
const GeometryUtil = require('./util/geometryutil');
const simplifyLib = require('./util/simplify');
const d3 = require('./util/d3-polygon');
const FitnessCalculator = require('./calculateFitness');

const log = log4js.getLogger(__filename);
log.level = 'debug';

module.exports = function(nestingRequest, done) {
    log.debug(`Started nesting, orderID = ${nestingRequest.orderID}`);

    let deepNest = new DeepNest(nestingRequest);
    deepNest.nest();

    log.debug(`Done nesting, orderID = ${nestingRequest.orderID}, generation count = ${deepNest.GA.generationNumber}`);
    done(deepNest.fullResult);
};

class DeepNest {
    constructor(nestingRequest){
        this.config = {
            clipperScale: 10000000,
            curveTolerance: 0.3,
            spacing: 0,
            rotations: 4,
            populationSize: 10,
            mutationRate: 10,
            threads: 4,
            placementType: 'gravity',
            mergeLines: true,
            timeRatio: 0.5,
            simplify: false
        };
        this.nestingRequest = nestingRequest;

        // list of all extracted parts
        // part: {name: 'part name', quantity: ...}
        this.parts = [];
        this.offset_parts = [];
        this.sheets = [];
        this.GA = null;
        this.fullResult = {};
        this.startTime = Date.now();
        this.prepareParts();
    }

    pointInPolygon(point, polygon) {
        // scaling is deliberately coarse to filter out points that lie *on* the polygon
        const p = this.svgToClipper(polygon, 1000);
        const pt = new ClipperLib.IntPoint(1000*point.x,1000*point.y);

        return ClipperLib.Clipper.PointInPolygon(pt, p) > 0;
    }

    cloneTree(tree) {
        const newtree = [];
        tree.forEach(function(t){
            newtree.push({x: t.x, y: t.y, exact: t.exact});
        });

        const self = this;
        if(tree.children && tree.children.length > 0){
            newtree.children = [];
            tree.children.forEach(function(c){
                newtree.children.push(self.cloneTree(c));
            });
        }
        return newtree;
    }

    prepareParts() {
        for(let i=0;i<this.nestingRequest.parts.length;i++) {
            let part = this.nestingRequest.parts[i];
            for(let j=0;j<part.instances.length;j++) {
                let instance = part.instances[j];
                let polygontree = [];
                for (let g = 0; g < part.geometry.length; g++) {
                    let contour = part.geometry[g];
                    for (let k = 0; k < contour.length; k++) {
                        let point = contour[k];
                        polygontree.push({x: point[0], y: point[1]});
                    }
                }
                let newPart = {
                    jid: instance.id,
                    sheet: false,
                    quantity: instance.quantity || 1,
                    polygontree: polygontree,
                };
                if (part.holes) {
                    let holes = [];
                    for (let g = 0; g < part.holes.length; g++) {
                        let newHole = [];
                        let hole = part.holes[g];
                        for (let k = 0; k < hole.length; k++) {
                            let point = hole[k];
                            newHole.push({x: point[0], y: point[1]});
                        }
                        holes.push(newHole);
                    }
                    newPart.children = holes;
                }
                this.parts.push(newPart);
            }
        }
        for(let i=0;i<this.nestingRequest.sheets.length;i++) {
            let sheet = this.nestingRequest.sheets[i];
            if (sheet.length === -1) {
                throw 'Infinite sheet length is not supported';
            }
            let polygontree = [];
            polygontree.push({x: 0, y: 0});
            polygontree.push({x: sheet.length, y: 0});
            polygontree.push({x: sheet.length, y: sheet.height});
            polygontree.push({x: 0, y: sheet.height});
            let newSheet = {
                jid: sheet.id,
                sheet: true,
                quantity: sheet.quality || 1,
                polygontree: polygontree
            };
            this.parts.push(newSheet);
        }
    }

    nest() {
        this.offset_parts = [];

        // send only bare essentials through ipc
        for(let i=0; i<this.parts.length; i++){
            this.offset_parts.push({
                quantity: this.parts[i].quantity,
                sheet: this.parts[i].sheet,
                polygontree: this.cloneTree(this.parts[i].polygontree)
            });
        }

        for(let i=0; i<this.offset_parts.length; i++){
            if(this.offset_parts[i].sheet){
                //offsetTree(this.offset_parts[i].polygontree, -0.5*this.config.spacing, this.polygonOffset.bind(this), this.simplifyPolygon.bind(this), true);
                offsetTree(this.offset_parts[i].polygontree, -0.5*this.config.spacing, this.polygonOffset.bind(this), undefined, true);
            }
            else{
                //offsetTree(this.offset_parts[i].polygontree, 0.5*this.config.spacing, this.polygonOffset.bind(this), this.simplifyPolygon.bind(this));
                offsetTree(this.offset_parts[i].polygontree, 0.5*this.config.spacing, this.polygonOffset.bind(this), undefined);
            }
        }

        // offset tree recursively
        function offsetTree(t, offset, offsetFunction, simpleFunction, inside) {
            let simple = t;
            if(simpleFunction){
                simple = simpleFunction(t, !!inside);
            }

            let offsetpaths = [simple];
            if(offset > 0){
                offsetpaths = offsetFunction(simple, offset);
            }

            if(offsetpaths.length > 0){
                //let cleaned = cleanFunction(offsetpaths[0]);

                // replace array items in place
                Array.prototype.splice.apply(t, [0, t.length].concat(offsetpaths[0]));
            }

            if(simple.children && simple.children.length > 0){
                if(!t.children){
                    t.children = [];
                }

                for(let i=0; i<simple.children.length; i++){
                    t.children.push(simple.children[i]);
                }
            }

            if(t.children && t.children.length > 0){
                for(let i=0; i<t.children.length; i++){
                    offsetTree(t.children[i], -offset, offsetFunction, simpleFunction, !inside);
                }
            }
        }

        let adam = [];
        let cur_id = 0;
        for(let i=0; i<this.offset_parts.length; i++) {
            if(!this.offset_parts[i].sheet) {
                for(let j=0; j<this.offset_parts[i].quantity; j++){
                    let poly = this.cloneTree(this.offset_parts[i].polygontree); // deep copy
                    poly.id = cur_id; // id is the unique id of all parts that will be nested, including cloned duplicates
                    poly.source = i; // source is the id of each unique part from the main part list
                    adam.push(poly);
                    cur_id++;
                }
            }
        }

        // seed with decreasing area
        adam.sort(function(a, b){
            return Math.abs(GeometryUtil.polygonArea(b)) - Math.abs(GeometryUtil.polygonArea(a));
        });

        this.GA = new GeneticAlgorithm(adam, this.config);
        let condition = true;
        while(condition) {
            for (let i=0; i<this.GA.population.length; i++) {
                this.calculateFitness(this.GA.population[i], i);
            }

            let best = this.GA.best();
            this.fillResult(best);

            //log.debug(`New generation, OrderID ${this.nestingRequest.orderID}`);
            // all individuals have been evaluated, nest next generation
            this.GA.generation();

            if ((Date.now() - this.startTime) > this.nestingRequest.time * 1000) {
                condition = false;
            }
        }
    }

    fillResult(best) {
        this.fullResult.message = 'successfully completed';
        let nestings = [];
        let nestingsPerSheet = new Map();
        for(let i=0; i<best.allplacements.length;i++){
            let sheetRequestID = this.parts[best.allplacements[i].sheet].jid;
            let newSheetNesting = {};
            if (nestingsPerSheet.has(sheetRequestID)) {
                newSheetNesting = nestingsPerSheet.get(sheetRequestID);
            }else {
                newSheetNesting.sheet = sheetRequestID;
                newSheetNesting.quantity = 1;
                // TODO: length and height
                nestingsPerSheet.set(sheetRequestID, newSheetNesting);
            }
            let nestedParts = [];
            if (newSheetNesting.nested_parts) {
                nestedParts = newSheetNesting.nested_parts;
            }else {
                newSheetNesting.nested_parts = nestedParts;
            }
            for(let j=0; j<best.allplacements[i].sheetplacements.length;j++) {
                let sheetPlacement = best.allplacements[i].sheetplacements[j];
                let newNestingPart = {
                    id: this.parts[sheetPlacement.source].jid,
                    position: [sheetPlacement.x, sheetPlacement.y],
                    angle: sheetPlacement.rotation,
                    flip: false
                };
                nestedParts.push(newNestingPart);
            }
        }
        for(let sheetNesting of nestingsPerSheet.values()) {
            nestings.push(sheetNesting);
        }
        this.fullResult.nestings = nestings;
    }

    calculateFitness(individual, index) {

        this.sheets = [];
        let sid = 0;
        for(let i=0; i<this.offset_parts.length; i++){
            if(this.offset_parts[i].sheet){
                let poly = this.cloneTree(this.offset_parts[i].polygontree);
                for(let j=0; j<this.offset_parts[i].quantity; j++){
                    poly.id = sid;
                    poly.source = i;
                    this.sheets.push(poly);
                    sid++;
                }
            }
        }

        FitnessCalculator.calculateFitness(this, individual, index);
    }

    getHull(polygon) {
        let points = [];
        for(let i=0; i<polygon.length; i++){
            points.push([polygon[i].x, polygon[i].y]);
        }
        let hullpoints = d3.polygonHull(points);

        if(!hullpoints){
            return null;
        }

        let hull = [];
        for(let i=0; i<hullpoints.length; i++){
            hull.push({x: hullpoints[i][0], y: hullpoints[i][1]});
        }

        return hull;
    }

    // use RDP simplification, then selectively offset
    simplifyPolygon(polygon, inside) {

        let tolerance = 4*this.config.curveTolerance;

        // give special treatment to line segments above this length (squared)
        let fixedTolerance = 40*this.config.curveTolerance*40*this.config.curveTolerance;
        var i,j;
        let self = this;

        if(this.config.simplify){
            /*
            // use convex hull
            var hull = new ConvexHullGrahamScan();
            for(var i=0; i<polygon.length; i++){
                hull.addPoint(polygon[i].x, polygon[i].y);
            }

            return hull.getHull();*/
            let hull = this.getHull(polygon);
            if(hull){
                return hull;
            }
            else{
                return polygon;
            }
        }

        let cleaned = this.cleanPolygon(polygon);
        if(cleaned && cleaned.length > 1){
            polygon = cleaned;
        }
        else{
            return polygon;
        }

        // polygon to polyline
        let copy = polygon.slice(0);
        copy.push(copy[0]);

        // mark all segments greater than ~0.25 in to be kept
        // the PD simplification algo doesn't care about the accuracy of long lines, only the absolute distance of each point
        // we care a great deal
        for(i=0; i<copy.length-1; i++){
            let p1 = copy[i];
            let p2 = copy[i+1];
            let sqd = (p2.x-p1.x)*(p2.x-p1.x) + (p2.y-p1.y)*(p2.y-p1.y);
            if(sqd > fixedTolerance){
                p1.marked = true;
                p2.marked = true;
            }
        }

        let simple = simplifyLib.simplify(copy, tolerance, true);
        // now a polygon again
        simple.pop();

        // could be dirty again (self intersections and/or coincident points)
        simple = this.cleanPolygon(simple);

        // simplification process reduced poly to a line or point
        if(!simple){
            simple = polygon;
        }

        var offsets = this.polygonOffset(simple, inside ? -tolerance : tolerance);

        var offset = null;
        var offsetArea = 0;
        var holes = [];
        for(i=0; i<offsets.length; i++){
            var area = GeometryUtil.polygonArea(offsets[i]);
            if(offset == null || area < offsetArea){
                offset = offsets[i];
                offsetArea = area;
            }
            if(area > 0){
                holes.push(offsets[i]);
            }
        }

        // mark any points that are exact
        for(i=0; i<simple.length; i++){
            var seg = [simple[i], simple[i+1 == simple.length ? 0 : i+1]];
            var index1 = find(seg[0], polygon, this.config);
            var index2 = find(seg[1], polygon, this.config);

            if(index1 + 1 === index2 || index2+1 === index1 || (index1 === 0 && index2 === polygon.length-1) || (index2 === 0 && index1 === polygon.length-1)){
                seg[0].exact = true;
                seg[1].exact = true;
            }
        }

        var numshells = 4;
        var shells = [];

        for(j=1; j<numshells; j++){
            var delta = j*(tolerance/numshells);
            delta = inside ? -delta : delta;
            var shell = this.polygonOffset(simple, delta);
            if(shell.length > 0){
                shell = shell[0];
            }
            shells[j] = shell;
        }

        if(!offset){
            return polygon;
        }

        // selective reversal of offset
        for(i=0; i<offset.length; i++){
            var o = offset[i];
            var target = getTarget(o, simple, 2*tolerance);

            // reverse point offset and try to find exterior points
            var test = clone(offset);
            test[i] = {x: target.x, y: target.y};

            if(!exterior(test, polygon, inside, this.config)){
                o.x = target.x;
                o.y = target.y;
            }
            else{
                // a shell is an intermediate offset between simple and offset
                for(j=1; j<numshells; j++){
                    if(shells[j]){
                        var shell = shells[j];
                        var delta = j*(tolerance/numshells);
                        target = getTarget(o, shell, 2*delta);
                        var test = clone(offset);
                        test[i] = {x: target.x, y: target.y};
                        if(!exterior(test, polygon, inside)){
                            o.x = target.x;
                            o.y = target.y;
                            break;
                        }
                    }
                }
            }
        }

        // straighten long lines
        // a rounded rectangle would still have issues at this point, as the long sides won't line up straight

        var straightened = false;

        for(i=0; i<offset.length; i++){
            var p1 = offset[i];
            var p2 = offset[i+1 === offset.length ? 0 : i+1];

            var sqd = (p2.x-p1.x)*(p2.x-p1.x) + (p2.y-p1.y)*(p2.y-p1.y);

            if(sqd < fixedTolerance){
                continue;
            }
            for(j=0; j<simple.length; j++){
                var s1 = simple[j];
                var s2 = simple[j+1 === simple.length ? 0 : j+1];

                var sqds = (p2.x-p1.x)*(p2.x-p1.x) + (p2.y-p1.y)*(p2.y-p1.y);

                if(sqds < fixedTolerance){
                    continue;
                }

                if((GeometryUtil.almostEqual(s1.x, s2.x) || GeometryUtil.almostEqual(s1.y, s2.y)) && // we only really care about vertical and horizontal lines
                    GeometryUtil.withinDistance(p1, s1, 2*tolerance) &&
                    GeometryUtil.withinDistance(p2, s2, 2*tolerance) &&
                    (!GeometryUtil.withinDistance(p1, s1, config.curveTolerance/1000) ||
                        !GeometryUtil.withinDistance(p2, s2, config.curveTolerance/1000))){
                    p1.x = s1.x;
                    p1.y = s1.y;
                    p2.x = s2.x;
                    p2.y = s2.y;
                    straightened = true;
                }
            }
        }

        //if(straightened){
        var Ac = toClipperCoordinates(offset);
        ClipperLib.JS.ScaleUpPath(Ac, 10000000);
        var Bc = toClipperCoordinates(polygon);
        ClipperLib.JS.ScaleUpPath(Bc, 10000000);

        var combined = new ClipperLib.Paths();
        var clipper = new ClipperLib.Clipper();

        clipper.AddPath(Ac, ClipperLib.PolyType.ptSubject, true);
        clipper.AddPath(Bc, ClipperLib.PolyType.ptSubject, true);

        // the line straightening may have made the offset smaller than the simplified
        if(clipper.Execute(ClipperLib.ClipType.ctUnion, combined, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero)){
            var largestArea = null;
            for(i=0; i<combined.length; i++){
                var n = toNestCoordinates(combined[i], 10000000);
                var sarea = -GeometryUtil.polygonArea(n);
                if(largestArea === null || largestArea < sarea){
                    offset = n;
                    largestArea = sarea;
                }
            }
        }
        //}

        cleaned = this.cleanPolygon(offset);
        if(cleaned && cleaned.length > 1){
            offset = cleaned;
        }

        // mark any points that are exact (for line merge detection)
        for(i=0; i<offset.length; i++){
            var seg = [offset[i], offset[i+1 == offset.length ? 0 : i+1]];
            var index1 = find(seg[0], polygon, this.config);
            var index2 = find(seg[1], polygon, this.config);

            if(index1 + 1 == index2 || index2+1 == index1 || (index1 == 0 && index2 == polygon.length-1) || (index2 == 0 && index1 == polygon.length-1)){
                seg[0].exact = true;
                seg[1].exact = true;
            }
        }

        if(!inside && holes && holes.length > 0){
            offset.children = holes;
        }

        return offset;

        function getTarget(point, simple, tol){
            var inrange = [];
            // find closest points within 2 offset deltas
            for(var j=0; j<simple.length; j++){
                var s = simple[j];
                var d2 = (o.x-s.x)*(o.x-s.x) + (o.y-s.y)*(o.y-s.y);
                if(d2 < tol*tol){
                    inrange.push({point: s, distance: d2});
                }
            }

            var target;
            if(inrange.length > 0){
                var filtered = inrange.filter(function(p){
                    return p.point.exact;
                });

                // use exact points when available, normal points when not
                inrange = filtered.length > 0 ? filtered : inrange;

                inrange.sort(function(a, b){
                    return a.distance - b.distance;
                });

                target = inrange[0].point;
            }
            else{
                var mind = null;
                for(j=0; j<simple.length; j++){
                    var s = simple[j];
                    var d2 = (o.x-s.x)*(o.x-s.x) + (o.y-s.y)*(o.y-s.y);
                    if(mind === null || d2 < mind){
                        target = s;
                        mind = d2;
                    }
                }
            }

            return target;
        }

        // returns true if any complex vertices fall outside the simple polygon
        function exterior(simple, complex, inside, config){
            // find all protruding vertices
            for(var i=0; i<complex.length; i++){
                var v = complex[i];
                if(!inside && !self.pointInPolygon(v, simple) && find(v, simple, config) === null){
                    return true;
                }
                if(inside && self.pointInPolygon(v, simple) && !find(v, simple, config) === null){
                    return true;
                }
            }
            return false;
        }

        function toClipperCoordinates(polygon){
            var clone = [];
            for(var i=0; i<polygon.length; i++){
                clone.push({
                    X: polygon[i].x,
                    Y: polygon[i].y
                });
            }

            return clone;
        };

        function toNestCoordinates(polygon, scale){
            var clone = [];
            for(var i=0; i<polygon.length; i++){
                clone.push({
                    x: polygon[i].X/scale,
                    y: polygon[i].Y/scale
                });
            }

            return clone;
        };

        function find(v, p, config){
            for(var i=0; i<p.length; i++){
                if(GeometryUtil.withinDistance(v, p[i], config.curveTolerance/1000)){
                    return i;
                }
            }
            return null;
        }

        function clone(p){
            var newp = [];
            for(var i=0; i<p.length; i++){
                newp.push({
                    x: p[i].x,
                    y: p[i].y
                });
            }

            return newp;
        }
    }

    // use the clipper library to return an offset to the given polygon. Positive offset expands the polygon, negative contracts
    // note that this returns an array of polygons
    polygonOffset(polygon, offset) {
        if(!offset || offset === 0 || GeometryUtil.almostEqual(offset, 0)){
            return polygon;
        }

        let p = this.svgToClipper(polygon);

        let miterLimit = 4;
        let co = new ClipperLib.ClipperOffset(miterLimit, this.config.curveTolerance*this.config.clipperScale);
        co.AddPath(p, ClipperLib.JoinType.jtMiter, ClipperLib.EndType.etClosedPolygon);

        let newpaths = new ClipperLib.Paths();
        co.Execute(newpaths, offset*this.config.clipperScale);

        let result = [];
        for(let i=0; i<newpaths.length; i++){
            result.push(this.clipperToSvg(newpaths[i]));
        }

        return result;
    };

    // returns a less complex polygon that satisfies the curve tolerance
    cleanPolygon(polygon) {
        let p = this.svgToClipper(polygon);
        // remove self-intersections and find the biggest polygon that's left
        let simple = ClipperLib.Clipper.SimplifyPolygon(p, ClipperLib.PolyFillType.pftNonZero);

        if(!simple || simple.length === 0){
            return null;
        }

        let biggest = simple[0];
        let biggestarea = Math.abs(ClipperLib.Clipper.Area(biggest));
        for(let i=1; i<simple.length; i++){
            let area = Math.abs(ClipperLib.Clipper.Area(simple[i]));
            if(area > biggestarea){
                biggest = simple[i];
                biggestarea = area;
            }
        }

        // clean up singularities, coincident points and edges
        let clean = ClipperLib.Clipper.CleanPolygon(biggest, 0.01*this.config.curveTolerance*this.config.clipperScale);

        if(!clean || clean.length === 0){
            return null;
        }

        let cleaned = this.clipperToSvg(clean);

        // remove duplicate endpoints
        let start = cleaned[0];
        let end = cleaned[cleaned.length-1];
        if(start === end || (GeometryUtil.almostEqual(start.x,end.x) && GeometryUtil.almostEqual(start.y,end.y))){
            cleaned.pop();
        }

        return cleaned;
    }

    // converts a polygon from normal float coordinates to integer coordinates used by clipper, as well as x/y -> X/Y
    svgToClipper(polygon, scale) {
        let clip = [];
        for(let i=0; i<polygon.length; i++) {
            clip.push({X: polygon[i].x, Y: polygon[i].y});
        }

        ClipperLib.JS.ScaleUpPath(clip, scale || this.config.clipperScale);

        return clip;
    }

    clipperToSvg(polygon) {
        let normal = [];
        for(let i=0; i<polygon.length; i++){
            normal.push({x: polygon[i].X/this.config.clipperScale, y: polygon[i].Y/this.config.clipperScale});
        }
        return normal;
    }
}

class GeneticAlgorithm {
    constructor(adam, config) {
        this.config = config || { populationSize: 10, mutationRate: 10, rotations: 4 };
        // population is an array of individuals. Each individual is a object representing the order of insertion and the angle each part is rotated
        let angles = [];
        for(let i=0; i<adam.length; i++){
            let angle = Math.floor(Math.random()*this.config.rotations)*(360/this.config.rotations);
            angles.push(angle);
        }
        this.population = [{placement: adam, rotation: angles}];
        while(this.population.length < this.config.populationSize){
            let mutant = this.mutate(this.population[0]);
            this.population.push(mutant);
        }
        this.generationNumber = 1;
   }

    // returns a mutated individual with the given mutation rate
    mutate(individual) {
        let clone = {placement: individual.placement.slice(0), rotation: individual.rotation.slice(0)};
        for(let i=0; i<clone.placement.length; i++){
            let rand = Math.random();
            if(rand < 0.01*this.config.mutationRate){
                // swap current part with next part
                let j = i+1;
                if(j < clone.placement.length){
                    let temp = clone.placement[i];
                    clone.placement[i] = clone.placement[j];
                    clone.placement[j] = temp;
                }
            }
            rand = Math.random();
            if(rand < 0.01*this.config.mutationRate){
                clone.rotation[i] = Math.floor(Math.random()*this.config.rotations)*(360/this.config.rotations);
            }
        }
        return clone;
    }

    // single point crossover
    mate(male, female){
        let cutpoint = Math.round(Math.min(Math.max(Math.random(), 0.1), 0.9)*(male.placement.length-1));

        let gene1 = male.placement.slice(0,cutpoint);
        let rot1 = male.rotation.slice(0,cutpoint);

        let gene2 = female.placement.slice(0,cutpoint);
        let rot2 = female.rotation.slice(0,cutpoint);

        let i;

        for(i=0; i<female.placement.length; i++){
            if(!contains(gene1, female.placement[i].id)){
                gene1.push(female.placement[i]);
                rot1.push(female.rotation[i]);
            }
        }

        for(i=0; i<male.placement.length; i++){
            if(!contains(gene2, male.placement[i].id)){
                gene2.push(male.placement[i]);
                rot2.push(male.rotation[i]);
            }
        }

        function contains(gene, id){
            for(let i=0; i<gene.length; i++){
                if(gene[i].id === id){
                    return true;
                }
            }
            return false;
        }

        return [{placement: gene1, rotation: rot1},{placement: gene2, rotation: rot2}];
    }

    best() {
        this.population.sort(function(a, b){
            return a.fitness - b.fitness;
        });

        return this.population[0];
    }

    generation() {
        this.generationNumber++;

        // Individuals with higher fitness are more likely to be selected for mating
        this.population.sort(function(a, b){
            return a.fitness - b.fitness;
        });

        // fittest individual is preserved in the new generation (elitism)
        let newpopulation = [this.population[0]];

        while(newpopulation.length < this.population.length){
            let male = this.randomWeightedIndividual();
            let female = this.randomWeightedIndividual(male);

            // each mating produces two children
            let children = this.mate(male, female);

            // slightly mutate children
            newpopulation.push(this.mutate(children[0]));

            if(newpopulation.length < this.population.length){
                newpopulation.push(this.mutate(children[1]));
            }
        }

        this.population = newpopulation;
    }

    // returns a random individual from the population, weighted to the front of the list (lower fitness value is more likely to be selected)
    randomWeightedIndividual(exclude){
        let pop = this.population.slice(0);

        if(exclude && pop.indexOf(exclude) >= 0){
            pop.splice(pop.indexOf(exclude),1);
        }

        let rand = Math.random();

        let lower = 0;
        let weight = 1/pop.length;
        let upper = weight;

        for(let i=0; i<pop.length; i++){
            // if the random number falls between lower and upper bounds, select this individual
            if(rand > lower && rand < upper){
                return pop[i];
            }
            lower = upper;
            upper += 2*weight * ((pop.length-i)/pop.length);
        }

        return pop[0];
    }
}
