/*!
 * Deepnest
 * Licensed under GPLv3
 */

'use strict';

const log4js = require('log4js');
const ClipperLib = require('../../dependencies/deepnest/util/clippernode');
const GeometryUtil = require('../../dependencies/deepnest/util/geometryutil');
const addon = require('../../build/Release/addon');

const log = log4js.getLogger(__filename);
log.level = 'debug';


function clone(nfp){
    var newnfp = [];
    for(var i=0; i<nfp.length; i++){
        newnfp.push({
            x: nfp[i].x,
            y: nfp[i].y
        });
    }

    if(nfp.children && nfp.children.length > 0){
        newnfp.children = [];
        for(i=0; i<nfp.children.length; i++){
            var child = nfp.children[i];
            var newchild = [];
            for(var j=0; j<child.length; j++){
                newchild.push({
                    x: child[j].x,
                    y: child[j].y
                });
            }
            newnfp.children.push(newchild);
        }
    }

    return newnfp;
}

function cloneNfp(nfp, inner){
    if(!inner){
        return clone(nfp);
    }

    // inner nfp is actually an array of nfps
    var newnfp = [];
    for(var i=0; i<nfp.length; i++){
        newnfp.push(clone(nfp[i]));
    }

    return newnfp;
}

let fitnessCalculator = {};

fitnessCalculator.db = {
    has: function(obj){
        var key = 'A'+obj.A+'B'+obj.B+'Arot'+parseInt(obj.Arotation)+'Brot'+parseInt(obj.Brotation);
        if(fitnessCalculator.nfpcache[key]){
            return true;
        }
        return false;
    },

    find : function(obj, inner){
        var key = 'A'+obj.A+'B'+obj.B+'Arot'+parseInt(obj.Arotation)+'Brot'+parseInt(obj.Brotation);
        //console.log('key: ', key);
        if(fitnessCalculator.nfpcache[key]){
            return cloneNfp(fitnessCalculator.nfpcache[key], inner);
        }
        /*var keypath = './nfpcache/'+key+'.json';
        if(fs.existsSync(keypath)){
            // could be partially written
            obj = null;
            try{
                obj = JSON.parse(fs.readFileSync(keypath).toString());
            }
            catch(e){
                return null;
            }
            var nfp = obj.nfp;
            nfp.children = obj.children;

            fitnessCalculator.nfpcache[key] = clone(nfp);

            return nfp;
        }*/
        return null;
    },

    insert : function(obj, inner){
        var key = 'A'+obj.A+'B'+obj.B+'Arot'+parseInt(obj.Arotation)+'Brot'+parseInt(obj.Brotation);
        //if(fitnessCalculator.performance.memory.totalJSHeapSize < 0.8*fitnessCalculator.performance.memory.jsHeapSizeLimit){
            fitnessCalculator.nfpcache[key] = cloneNfp(obj.nfp, inner);
            //console.log('cached: ',fitnessCalculator.cache[key].poly);
            //console.log('using', fitnessCalculator.performance.memory.totalJSHeapSize/fitnessCalculator.performance.memory.jsHeapSizeLimit);
        //}

        /*obj.children = obj.nfp.children;

        var keypath = './nfpcache/'+key+'.json';
        fq.writeFile(keypath, JSON.stringify(obj), function (err) {
            if (err){
                console.log("couldn't write");
            }
        });*/
    }
}

module.exports.calculateFitness = function(deepNest, individual, index) {
    fitnessCalculator.nfpcache = {};

    let parts = individual.placement;
    let rotations = individual.rotation;

    for(let i=0; i<parts.length; i++){
        parts[i].rotation = rotations[i];
        // parts[i].id = ids[i];
        // parts[i].source = sources[i];
        // if(!data.config.simplify){
        //     parts[i].children = children[i];
        // }
    }

    // preprocess
    let pairs = [];
    let inpairs = function(key, p) {
        for(var i=0; i<p.length; i++){
            if(p[i].Asource === key.Asource && p[i].Bsource === key.Bsource && p[i].Arotation === key.Arotation && p[i].Brotation === key.Brotation){
                return true;
            }
        }
        return false;
    }
    for(var i=0; i<parts.length; i++){
        var B = parts[i];
        for(var j=0; j<i; j++){
            var A = parts[j];
            var key = {
                A: A,
                B: B,
                Arotation: A.rotation,
                Brotation: B.rotation,
                Asource: A.source,
                Bsource: B.source
            };
            var doc = {
                A: A.source,
                B: B.source,
                Arotation: A.rotation,
                Brotation: B.rotation
            }
            if(!inpairs(key, pairs) && !fitnessCalculator.db.has(doc)){
                pairs.push(key);
            }
        }
    }

    log.debug('pairs: ', pairs.length);

    let process = function(pair){
        let A = rotatePolygon(pair.A, pair.Arotation);
        let B = rotatePolygon(pair.B, pair.Brotation);

        let Ac = toClipperCoordinates(A);
        ClipperLib.JS.ScaleUpPath(Ac, 10000000);
        let Bc = toClipperCoordinates(B);
        ClipperLib.JS.ScaleUpPath(Bc, 10000000);
        for(let i=0; i<Bc.length; i++){
            Bc[i].X *= -1;
            Bc[i].Y *= -1;
        }
        let solution = ClipperLib.Clipper.MinkowskiSum(Ac, Bc, true);
        let clipperNfp;

        let largestArea = null;
        for(i=0; i<solution.length; i++) {
            let n = toNestCoordinates(solution[i], 10000000);
            let sarea = -GeometryUtil.polygonArea(n);
            if(largestArea === null || largestArea < sarea){
                clipperNfp = n;
                largestArea = sarea;
            }
        }

        for(let i=0; i<clipperNfp.length; i++) {
            clipperNfp[i].x += B[0].x;
            clipperNfp[i].y += B[0].y;
        }

        pair.A = null;
        pair.B = null;
        pair.nfp = clipperNfp;
        return pair;

        function toClipperCoordinates(polygon) {
            let clone = [];
            for(let i=0; i<polygon.length; i++) {
                clone.push({
                    X: polygon[i].x,
                    Y: polygon[i].y
                });
            }
            return clone;
        };

        function toNestCoordinates(polygon, scale) {
            let clone = [];
            for(let i=0; i<polygon.length; i++){
                clone.push({
                    x: polygon[i].X/scale,
                    y: polygon[i].Y/scale
                });
            }
            return clone;
        };

        function rotatePolygon(polygon, degrees) {
            let rotated = [];
            let angle = degrees * Math.PI / 180;
            for(let i=0; i<polygon.length; i++) {
                let x = polygon[i].x;
                let y = polygon[i].y;
                let x1 = x*Math.cos(angle)-y*Math.sin(angle);
                let y1 = x*Math.sin(angle)+y*Math.cos(angle);
                rotated.push({x:x1, y:y1});
            }
            return rotated;
        };
    }

    // run the placement synchronously
    function sync() {
        //console.log('starting synchronous calculations', Object.keys(fitnessCalculator.nfpCache).length);
        console.log('in sync');
        let c=0;
        for (let key in fitnessCalculator.nfpcache) {
            c++;
        }
        console.log('nfp cached:', c);
        let placement = placeParts(deepNest.sheets, parts, deepNest.config, index);
        individual.fitness = placement.fitness;
        individual.allplacements = placement.placements;
        placement.index = index;
    }

    console.time('Total');

    function getPart(source){
        for(let k=0; k<parts.length; k++){
            if(parts[k].source === source){
                return parts[k];
            }
        }
        return null;
    }

    if(pairs.length > 0) {
        // store processed data in cache
        for(let i=0; i<pairs.length; i++){
            process(pairs[i]);
        }
        for(let i=0; i<pairs.length; i++){
            // returned data only contains outer nfp, we have to account for any holes separately in the synchronous portion
            // this is because the c++ addon which can process interior nfps cannot run in the worker thread
            let A = getPart(pairs[i].Asource);
            let B = getPart(pairs[i].Bsource);

            let Achildren = [];

            let j;
            if(A.children){
                for(j=0; j<A.children.length; j++){
                    Achildren.push(rotatePolygon(A.children[j], pairs[i].Arotation));
                }
            }

            if(Achildren.length > 0){
                let Brotated = rotatePolygon(B, pairs[i].Brotation);
                let bbounds = GeometryUtil.getPolygonBounds(Brotated);
                let cnfp = [];

                for(j=0; j<Achildren.length; j++){
                    let cbounds = GeometryUtil.getPolygonBounds(Achildren[j]);
                    if(cbounds.width > bbounds.width && cbounds.height > bbounds.height){
                        let n = getInnerNfp(Achildren[j], Brotated, data.config);
                        if(n && n.length > 0){
                            cnfp = cnfp.concat(n);
                        }
                    }
                }

                pairs[i].nfp.children = cnfp;
            }
            let doc = {
                A: pairs[i].Asource,
                B: pairs[i].Bsource,
                Arotation: pairs[i].Arotation,
                Brotation: pairs[i].Brotation,
                nfp: pairs[i].nfp
            };
            fitnessCalculator.db.insert(doc);
        }
        console.timeEnd('Total');
        console.log('before sync');
        sync();
    }
    else{
        sync();
    }
}

// returns the square of the length of any merged lines
// filter out any lines less than minlength long
function mergedLength(parts, p, minlength, tolerance){
    let min2 = minlength*minlength;
    let totalLength = 0;
    let segments = [];

    for(let i=0; i<p.length; i++){
        var A1 = p[i];

        if(i+1 === p.length){
            var A2 = p[0];
        }
        else{
            var A2 = p[i+1];
        }

        if(!A1.exact || !A2.exact){
            continue;
        }

        let Ax2 = (A2.x-A1.x)*(A2.x-A1.x);
        let Ay2 = (A2.y-A1.y)*(A2.y-A1.y);

        if(Ax2+Ay2 < min2){
            continue;
        }

        let angle = Math.atan2((A2.y-A1.y),(A2.x-A1.x));

        let c = Math.cos(-angle);
        let s = Math.sin(-angle);

        let c2 = Math.cos(angle);
        let s2 = Math.sin(angle);

        let relA2 = {x: A2.x-A1.x, y: A2.y-A1.y};
        let rotA2x = relA2.x * c - relA2.y * s;

        for(let j=0; j<parts.length; j++){
            var B = parts[j];
            if(B.length > 1){
                for(let k=0; k<B.length; k++){
                    var B1 = B[k];

                    if(k+1 == B.length){
                        var B2 = B[0];
                    }
                    else{
                        var B2 = B[k+1];
                    }

                    if(!B1.exact || !B2.exact){
                        continue;
                    }
                    let Bx2 = (B2.x-B1.x)*(B2.x-B1.x);
                    let By2 = (B2.y-B1.y)*(B2.y-B1.y);

                    if(Bx2+By2 < min2){
                        continue;
                    }

                    // B relative to A1 (our point of rotation)
                    let relB1 = {x: B1.x - A1.x, y: B1.y - A1.y};
                    let relB2 = {x: B2.x - A1.x, y: B2.y - A1.y};

                    // rotate such that A1 and A2 are horizontal
                    let rotB1 = {x: relB1.x * c - relB1.y * s, y: relB1.x * s + relB1.y * c};
                    let rotB2 = {x: relB2.x * c - relB2.y * s, y: relB2.x * s + relB2.y * c};

                    if(!GeometryUtil.almostEqual(rotB1.y, 0, tolerance) || !GeometryUtil.almostEqual(rotB2.y, 0, tolerance)){
                        continue;
                    }

                    let min1 = Math.min(0, rotA2x);
                    let max1 = Math.max(0, rotA2x);

                    min2 = Math.min(rotB1.x, rotB2.x);
                    let max2 = Math.max(rotB1.x, rotB2.x);

                    // not overlapping
                    if(min2 >= max1 || max2 <= min1){
                        continue;
                    }

                    let len = 0;
                    let relC1x = 0;
                    let relC2x = 0;

                    // A is B
                    if(GeometryUtil.almostEqual(min1, min2) && GeometryUtil.almostEqual(max1, max2)){
                        len = max1-min1;
                        relC1x = min1;
                        relC2x = max1;
                    }
                    // A inside B
                    else if(min1 > min2 && max1 < max2){
                        len = max1-min1;
                        relC1x = min1;
                        relC2x = max1;
                    }
                    // B inside A
                    else if(min2 > min1 && max2 < max1){
                        len = max2-min2;
                        relC1x = min2;
                        relC2x = max2;
                    }
                    else{
                        len = Math.max(0, Math.min(max1, max2) - Math.max(min1, min2));
                        relC1x = Math.min(max1, max2);
                        relC2x = Math.max(min1, min2);
                    }

                    if(len*len > min2){
                        totalLength += len;

                        let relC1 = {x: relC1x * c2, y: relC1x * s2};
                        let relC2 = {x: relC2x * c2, y: relC2x * s2};

                        let C1 = {x: relC1.x + A1.x, y: relC1.y + A1.y};
                        let C2 = {x: relC2.x + A1.x, y: relC2.y + A1.y};

                        segments.push([C1, C2]);
                    }
                }
            }

            if(B.children && B.children.length > 0){
                let child = mergedLength(B.children, p, minlength, tolerance);
                totalLength += child.totalLength;
                segments = segments.concat(child.segments);
            }
        }
    }

    return {totalLength: totalLength, segments: segments};
}

function shiftPolygon(p, shift){
    let shifted = [];
    for(let i=0; i<p.length; i++){
        shifted.push({x: p[i].x+shift.x, y:p[i].y+shift.y, exact: p[i].exact});
    }
    if(p.children && p.children.length){
        shifted.children = [];
        for(i=0; i<p.children.length; i++){
            shifted.children.push(shiftPolygon(p.children[i], shift));
        }
    }

    return shifted;
}

// jsClipper uses X/Y instead of x/y...
function toClipperCoordinates(polygon){
    let clone = [];
    for(let i=0; i<polygon.length; i++){
        clone.push({
            X: polygon[i].x,
            Y: polygon[i].y
        });
    }

    return clone;
}

// returns clipper nfp. Remember that clipper nfp are a list of polygons, not a tree!
function nfpToClipperCoordinates(nfp, config){
    let clipperNfp = [];

    // children first
    if(nfp.children && nfp.children.length > 0){
        for(var j=0; j<nfp.children.length; j++){
            if(GeometryUtil.polygonArea(nfp.children[j]) < 0){
                nfp.children[j].reverse();
            }
            var childNfp = toClipperCoordinates(nfp.children[j]);
            ClipperLib.JS.ScaleUpPath(childNfp, config.clipperScale);
            clipperNfp.push(childNfp);
        }
    }

    if(GeometryUtil.polygonArea(nfp) > 0){
        nfp.reverse();
    }

    let outerNfp = toClipperCoordinates(nfp);

    // clipper js defines holes based on orientation

    ClipperLib.JS.ScaleUpPath(outerNfp, config.clipperScale);
    //var cleaned = ClipperLib.Clipper.CleanPolygon(outerNfp, 0.00001*config.clipperScale);

    clipperNfp.push(outerNfp);
    //var area = Math.abs(ClipperLib.Clipper.Area(cleaned));

    return clipperNfp;
}

// inner nfps can be an array of nfps, outer nfps are always singular
function innerNfpToClipperCoordinates(nfp, config){
    let clipperNfp = [];
    for(let i=0; i<nfp.length; i++){
        let clip = nfpToClipperCoordinates(nfp[i], config);
        clipperNfp = clipperNfp.concat(clip);
    }

    return clipperNfp;
}

function toNestCoordinates(polygon, scale){
    let clone = [];
    for(let i=0; i<polygon.length; i++){
        clone.push({
            x: polygon[i].X/scale,
            y: polygon[i].Y/scale
        });
    }

    return clone;
}

function getHull(polygon){
    // convert to hulljs format
    /*let hull = new ConvexHullGrahamScan();
    for(let i=0; i<polygon.length; i++){
        hull.addPoint(polygon[i].x, polygon[i].y);
    }

    return hull.getHull();*/
    let points = [];
    for(let i=0; i<polygon.length; i++){
        points.push([polygon[i].x, polygon[i].y]);
    }
    let hullpoints = d3.polygonHull(points);

    if(!hullpoints){
        return polygon;
    }

    let hull = [];
    for(let i=0; i<hullpoints.length; i++){
        hull.push({x: hullpoints[i][0], y: hullpoints[i][1]});
    }

    return hull;
}

function rotatePolygon(polygon, degrees){
    let rotated = [];
    let angle = degrees * Math.PI / 180;
    for(let i=0; i<polygon.length; i++){
        let x = polygon[i].x;
        let y = polygon[i].y;
        let x1 = x*Math.cos(angle)-y*Math.sin(angle);
        let y1 = x*Math.sin(angle)+y*Math.cos(angle);

        rotated.push({x:x1, y:y1, exact: polygon[i].exact});
    }

    if(polygon.children && polygon.children.length > 0){
        rotated.children = [];
        for(let j=0; j<polygon.children.length; j++){
            rotated.children.push(rotatePolygon(polygon.children[j], degrees));
        }
    }

    return rotated;
}

function getOuterNfp(A, B, inside){
    let nfp;

    /*var numpoly = A.length + B.length;
    if(A.children && A.children.length > 0){
        A.children.forEach(function(c){
            numpoly += c.length;
        });
    }
    if(B.children && B.children.length > 0){
        B.children.forEach(function(c){
            numpoly += c.length;
        });
    }*/

    // try the file cache if the calculation will take a long time
    let doc = fitnessCalculator.db.find({ A: A.source, B: B.source, Arotation: A.rotation, Brotation: B.rotation });

    if(doc){
        return doc;
    }

    // not found in cache
    if(inside || (A.children && A.children.length > 0)){
        //console.log('computing minkowski: ',A.length, B.length);
        //console.time('addon');
        nfp = addon.calculateNFP({A: A, B: B});
        //console.timeEnd('addon');
    }
    else{
        console.log('minkowski', A.length, B.length, A.source, B.source);
        console.time('clipper');

        let Ac = toClipperCoordinates(A);
        ClipperLib.JS.ScaleUpPath(Ac, 10000000);
        let Bc = toClipperCoordinates(B);
        ClipperLib.JS.ScaleUpPath(Bc, 10000000);
        for(let i=0; i<Bc.length; i++){
            Bc[i].X *= -1;
            Bc[i].Y *= -1;
        }
        let solution = ClipperLib.Clipper.MinkowskiSum(Ac, Bc, true);
        //console.log(solution.length, solution);
        //var clipperNfp = toNestCoordinates(solution[0], 10000000);
        let clipperNfp;

        let largestArea = null;
        for(let i=0; i<solution.length; i++){
            let n = toNestCoordinates(solution[i], 10000000);
            let sarea = -GeometryUtil.polygonArea(n);
            if(largestArea === null || largestArea < sarea){
                clipperNfp = n;
                largestArea = sarea;
            }
        }

        for(let i=0; i<clipperNfp.length; i++){
            clipperNfp[i].x += B[0].x;
            clipperNfp[i].y += B[0].y;
        }

        nfp = [clipperNfp];
        //console.log('clipper nfp', JSON.stringify(nfp));
        console.timeEnd('clipper');
    }

    if(!nfp || nfp.length === 0){
        //console.log('holy shit', nfp, A, B, JSON.stringify(A), JSON.stringify(B));
        return null
    }

    nfp = nfp.pop();

    if(!nfp || nfp.length === 0){
        return null;
    }

    if(!inside && typeof A.source !== 'undefined' && typeof B.source !== 'undefined'){
        // insert into db
        doc = {
            A: A.source,
            B: B.source,
            Arotation: A.rotation,
            Brotation: B.rotation,
            nfp: nfp
        };
        fitnessCalculator.db.insert(doc);
    }

    return nfp;
}

function getFrame(A){
    let bounds = GeometryUtil.getPolygonBounds(A);

    // expand bounds by 10%
    bounds.width *= 1.1;
    bounds.height *= 1.1;
    bounds.x -= 0.5*(bounds.width - (bounds.width/1.1));
    bounds.y -= 0.5*(bounds.height - (bounds.height/1.1));

    let frame = [];
    frame.push({ x: bounds.x, y: bounds.y });
    frame.push({ x: bounds.x+bounds.width, y: bounds.y });
    frame.push({ x: bounds.x+bounds.width, y: bounds.y+bounds.height });
    frame.push({ x: bounds.x, y: bounds.y+bounds.height });

    frame.children = [A];
    frame.source = A.source;
    frame.rotation = 0;

    return frame;
}

function getInnerNfp(A, B, config){
    if(typeof A.source !== 'undefined' && typeof B.source !== 'undefined'){
        let doc = fitnessCalculator.db.find({ A: A.source, B: B.source, Arotation: 0, Brotation: B.rotation }, true);

        if(doc){
            //console.log('fetch inner', A.source, B.source, doc);
            return doc;
        }
    }

    let frame = getFrame(A);

    let nfp = getOuterNfp(frame, B, true);

    if(!nfp || !nfp.children || nfp.children.length == 0){
        return null;
    }

    let holes = [];
    if(A.children && A.children.length > 0){
        for(let i=0; i<A.children.length; i++){
            let hnfp = getOuterNfp(A.children[i], B);
            if(hnfp){
                holes.push(hnfp);
            }
        }
    }

    if(holes.length === 0){
        return nfp.children;
    }

    let clipperNfp = innerNfpToClipperCoordinates(nfp.children, config);
    let clipperHoles = innerNfpToClipperCoordinates(holes, config);

    let finalNfp = new ClipperLib.Paths();
    let clipper = new ClipperLib.Clipper();

    clipper.AddPaths(clipperHoles, ClipperLib.PolyType.ptClip, true);
    clipper.AddPaths(clipperNfp, ClipperLib.PolyType.ptSubject, true);

    if(!clipper.Execute(ClipperLib.ClipType.ctDifference, finalNfp, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero)){
        return nfp.children;
    }

    if(finalNfp.length === 0){
        return null;
    }

    let f = [];
    for(let i=0; i<finalNfp.length; i++){
        f.push(toNestCoordinates(finalNfp[i], config.clipperScale));
    }

    if(typeof A.source !== 'undefined' && typeof B.source !== 'undefined'){
        // insert into db
        console.log('inserting inner: ',A.source, B.source, B.rotation, f);
        let doc = {
            A: A.source,
            B: B.source,
            Arotation: 0,
            Brotation: B.rotation,
            nfp: f
        };
        fitnessCalculator.db.insert(doc, true);
    }

    return f;
}

function placeParts(sheets, parts, config, nestindex){

    if(!sheets){
        return null;
    }

    let i, j, k, m, n, part;

    let totalnum = parts.length;
    let totalsheetarea = 0;

    // total length of merged lines
    let totalMerged = 0;

    // rotate paths by given rotation
    let rotated = [];
    for(i=0; i<parts.length; i++){
        let r = rotatePolygon(parts[i], parts[i].rotation);
        r.rotation = parts[i].rotation;
        r.source = parts[i].source;
        r.id = parts[i].id;

        rotated.push(r);
    }

    parts = rotated;

    let allplacements = [];
    let fitness = 0;
    //var binarea = Math.abs(GeometryUtil.polygonArea(self.binPolygon));

    let key, nfp;

    while(parts.length > 0){

        let placed = [];
        let placements = [];

        // open a new sheet
        let sheet = sheets.shift();
        var sheetarea = Math.abs(GeometryUtil.polygonArea(sheet));
        totalsheetarea += sheetarea;

        fitness += sheetarea; // add 1 for each new sheet opened (lower fitness is better)

        let clipCache = [];
        //console.log('new sheet');
        for(i=0; i<parts.length; i++){
            console.time('placement');
            part = parts[i];

            // inner NFP
            let sheetNfp = null;
            // try all possible rotations until it fits
            // (only do this for the first part of each sheet, to ensure that all parts that can be placed are, even if we have to to open a lot of sheets)
            for(j=0; j<config.rotations; j++){
                sheetNfp = getInnerNfp(sheet, part, config);

                if(sheetNfp){
                    break;
                }

                let r = rotatePolygon(part, 360/config.rotations);
                r.rotation = part.rotation + (360/config.rotations);
                r.source = part.source;
                r.id = part.id;

                // rotation is not in-place
                part = r;
                parts[i] = r;

                if(part.rotation > 360){
                    part.rotation = part.rotation%360;
                }
            }
            // part unplaceable, skip
            if(!sheetNfp || sheetNfp.length === 0){
                continue;
            }

            let position = null;

            if(placed.length === 0){
                // first placement, put it on the top left corner
                for(j=0; j<sheetNfp.length; j++){
                    for(k=0; k<sheetNfp[j].length; k++){
                        if(position === null || sheetNfp[j][k].x-part[0].x < position.x || (GeometryUtil.almostEqual(sheetNfp[j][k].x-part[0].x, position.x) && sheetNfp[j][k].y-part[0].y < position.y ) ){
                            position = {
                                x: sheetNfp[j][k].x-part[0].x,
                                y: sheetNfp[j][k].y-part[0].y,
                                id: part.id,
                                rotation: part.rotation,
                                source: part.source
                            }
                        }
                    }
                }
                if(position === null){
                    console.log(sheetNfp);
                }
                placements.push(position);
                placed.push(part);

                continue;
            }

            let clipperSheetNfp = innerNfpToClipperCoordinates(sheetNfp, config);

            let clipper = new ClipperLib.Clipper();
            let combinedNfp = new ClipperLib.Paths();

            let error = false;

            // check if stored in clip cache
            //var startindex = 0;
            let clipkey = 's:'+part.source+'r:'+part.rotation;
            let startindex = 0;
            if(clipCache[clipkey]){
                let prevNfp = clipCache[clipkey].nfp;
                clipper.AddPaths(prevNfp, ClipperLib.PolyType.ptSubject, true);
                startindex = clipCache[clipkey].index;
            }

            for(j=startindex; j<placed.length; j++){
                nfp = getOuterNfp(placed[j], part);
                // minkowski difference failed. very rare but could happen
                if(!nfp){
                    error = true;
                    break;
                }
                // shift to placed location
                for(m=0; m<nfp.length; m++){
                    nfp[m].x += placements[j].x;
                    nfp[m].y += placements[j].y;
                }

                if(nfp.children && nfp.children.length > 0){
                    for(n=0; n<nfp.children.length; n++){
                        for(var o=0; o<nfp.children[n].length; o++){
                            nfp.children[n][o].x += placements[j].x;
                            nfp.children[n][o].y += placements[j].y;
                        }
                    }
                }

                let clipperNfp = nfpToClipperCoordinates(nfp, config);

                clipper.AddPaths(clipperNfp, ClipperLib.PolyType.ptSubject, true);
            }

            if(error || !clipper.Execute(ClipperLib.ClipType.ctUnion, combinedNfp, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero)){
                console.log('clipper error', error);
                continue;
            }

            /*var converted = [];
            for(j=0; j<combinedNfp.length; j++){
                converted.push(toNestCoordinates(combinedNfp[j], config.clipperScale));
            }*/

            clipCache[clipkey] = {
                nfp: combinedNfp,
                index: placed.length-1
            };

            console.log('save cache', placed.length-1);

            // difference with sheet polygon
            let finalNfp = new ClipperLib.Paths();
            clipper = new ClipperLib.Clipper();

            clipper.AddPaths(combinedNfp, ClipperLib.PolyType.ptClip, true);

            clipper.AddPaths(clipperSheetNfp, ClipperLib.PolyType.ptSubject, true);

            if(!clipper.Execute(ClipperLib.ClipType.ctDifference, finalNfp, ClipperLib.PolyFillType.pftEvenOdd, ClipperLib.PolyFillType.pftNonZero)){
                continue;
            }

            if(!finalNfp || finalNfp.length === 0){
                continue;
            }

            let f = [];
            for(j=0; j<finalNfp.length; j++){
                // back to normal scale
                f.push(toNestCoordinates(finalNfp[j], config.clipperScale));
            }
            finalNfp = f;

            // choose placement that results in the smallest bounding box/hull etc
            // todo: generalize gravity direction
            var minwidth = null;
            var minarea = null;
            let minx = null;
            let miny = null;
            let nf, area, shiftvector;

            let allpoints = [];
            for(m=0; m<placed.length; m++){
                for(n=0; n<placed[m].length; n++){
                    allpoints.push({x:placed[m][n].x+placements[m].x, y: placed[m][n].y+placements[m].y});
                }
            }

            let allbounds;
            let partbounds;
            if(config.placementType === 'gravity' || config.placementType === 'box'){
                allbounds = GeometryUtil.getPolygonBounds(allpoints);

                let partpoints = [];
                for(m=0; m<part.length; m++){
                    partpoints.push({x: part[m].x, y:part[m].y});
                }
                partbounds = GeometryUtil.getPolygonBounds(partpoints);
            }
            else{
                allpoints = getHull(allpoints);
            }
            for(j=0; j<finalNfp.length; j++){
                nf = finalNfp[j];
                //console.log('evalnf',nf.length);
                for(k=0; k<nf.length; k++){

                    shiftvector = {
                        x: nf[k].x-part[0].x,
                        y: nf[k].y-part[0].y,
                        id: part.id,
                        source: part.source,
                        rotation: part.rotation
                    };


                    /*for(m=0; m<part.length; m++){
                        localpoints.push({x: part[m].x+shiftvector.x, y:part[m].y+shiftvector.y});
                    }*/
                    //console.time('evalbounds');

                    if(config.placementType === 'gravity' || config.placementType === 'box'){
                        var rectbounds = GeometryUtil.getPolygonBounds([
                            // allbounds points
                            {x: allbounds.x, y:allbounds.y},
                            {x: allbounds.x+allbounds.width, y:allbounds.y},
                            {x: allbounds.x+allbounds.width, y:allbounds.y+allbounds.height},
                            {x: allbounds.x, y:allbounds.y+allbounds.height},

                            // part points
                            {x: partbounds.x+shiftvector.x, y:partbounds.y+shiftvector.y},
                            {x: partbounds.x+partbounds.width+shiftvector.x, y:partbounds.y+shiftvector.y},
                            {x: partbounds.x+partbounds.width+shiftvector.x, y:partbounds.y+partbounds.height+shiftvector.y},
                            {x: partbounds.x+shiftvector.x, y:partbounds.y+partbounds.height+shiftvector.y}
                        ]);

                        // weigh width more, to help compress in direction of gravity
                        if(config.placementType === 'gravity'){
                            area = rectbounds.width*2 + rectbounds.height;
                        }
                        else{
                            area = rectbounds.width * rectbounds.height;
                        }
                    }
                    else{
                        // must be convex hull
                        let localpoints = clone(allpoints);

                        for(m=0; m<part.length; m++){
                            localpoints.push({x: part[m].x+shiftvector.x, y:part[m].y+shiftvector.y});
                        }

                        area = Math.abs(GeometryUtil.polygonArea(getHull(localpoints)));
                        shiftvector.hull = getHull(localpoints);
                        shiftvector.hullsheet = getHull(sheet);
                    }

                    //console.timeEnd('evalbounds');
                    //console.time('evalmerge');

                    if(config.mergeLines){
                        // if lines can be merged, subtract savings from area calculation
                        let shiftedpart = shiftPolygon(part, shiftvector);
                        let shiftedplaced = [];

                        for(m=0; m<placed.length; m++){
                            shiftedplaced.push(shiftPolygon(placed[m], placements[m]));
                        }

                        // don't check small lines, cut off at about 1/2 in
                        let minlength = 0.5*config.scale;
                        var merged = mergedLength(shiftedplaced, shiftedpart, minlength, 0.1*config.curveTolerance);
                        area -= merged.totalLength*config.timeRatio;
                    }

                    //console.timeEnd('evalmerge');

                    if(
                        minarea === null ||
                        area < minarea ||
                        (GeometryUtil.almostEqual(minarea, area) && (minx === null || shiftvector.x < minx)) ||
                        (GeometryUtil.almostEqual(minarea, area) && (minx !== null && GeometryUtil.almostEqual(shiftvector.x, minx) && shiftvector.y < miny))
                    ){
                        minarea = area;
                        minwidth = rectbounds ? rectbounds.width : 0;
                        position = shiftvector;
                        if(minx === null || shiftvector.x < minx){
                            minx = shiftvector.x;
                        }
                        if(miny === null || shiftvector.y < miny){
                            miny = shiftvector.y;
                        }

                        if(config.mergeLines){
                            position.mergedLength = merged.totalLength;
                            position.mergedSegments = merged.segments;
                        }
                    }
                }
            }

            if(position){
                placed.push(part);
                placements.push(position);
                if(position.mergedLength){
                    totalMerged += position.mergedLength;
                }
            }

            // send placement progress signal
            let placednum = placed.length;
            for(j=0; j<allplacements.length; j++){
                placednum += allplacements[j].sheetplacements.length;
            }
            //console.log(placednum, totalnum);
            //ipcRenderer.send('background-progress', {index: nestindex, progress: 0.5 + 0.5*(placednum/totalnum)});
            console.timeEnd('placement');
        }

        if(minwidth && minarea){
            fitness += (minwidth/sheetarea) + minarea;
        }

        for(i=0; i<placed.length; i++){
            let index = parts.indexOf(placed[i]);
            if(index >= 0){
                parts.splice(index,1);
            }
        }

        if(placements && placements.length > 0){
            allplacements.push({sheet: sheet.source, sheetid: sheet.id, sheetplacements: placements});
        }
        else{
            break; // something went wrong
        }

        if(sheets.length == 0){
            break;
        }
    }

    // there were parts that couldn't be placed
    // scale this value high - we really want to get all the parts in, even at the cost of opening new sheets
    for(i=0; i<parts.length; i++){
        fitness += 100000000*(Math.abs(GeometryUtil.polygonArea(parts[i]))/totalsheetarea);
    }
    // send finish progerss signal
    //ipcRenderer.send('background-progress', {index: nestindex, progress: -1});

    return {placements: allplacements, fitness: fitness, area: sheetarea, mergedLength: totalMerged };
}

// clipperjs uses alerts for warnings
function alert(message) {
    console.log('alert: ', message);
}
