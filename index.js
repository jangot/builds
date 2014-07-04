var CANVAS_HEIGHT = 500;
var CANVAS_WIDTH = 1000;
var canvas = document.getElementById('canvas');

function drawLine(points, color) {
    if (!points) {
        points = [];
    }

    color = color || 'blue';

    var context = canvas.getContext('2d');

    context.beginPath();
    for (var i = 0; i < points.length; i++) {
        var x = points[i][0];
        var y = CANVAS_HEIGHT - points[i][1];
        context.lineTo(x, y);
    }

    context.lineWidth = 5;
    context.strokeStyle = color;
    context.stroke();
}

function drawBuilds(builds) {
    if (!builds) {
        builds = [];
    }

    var context = canvas.getContext('2d');
    for (var i = 0; i < builds.length; i++) {
        context.beginPath();
        var x = builds[i][0];
        var y = CANVAS_HEIGHT - builds[i][1];
        var w = builds[i][2];
        var h = builds[i][1];
        context.rect(x, y, w, h);

        context.strokeStyle = builds[i][3] || 'black';
        context.stroke();
    }
}

/**
 * Algorithm
 */

function pointInFigure(point, figure) {
    var cross = 0;
    for (var i = 0; i < figure.length; i++) {
        var figurePoint1 = figure[i];
        var figurePoint2 = figure[i + 1] || figure[0];

        if (point[1] < figurePoint1[1] && point[1] < figurePoint2[1]) {
            cross++
        }
    }

    return Boolean(cross % 2);
}

function pointCrossSegment(point, segment) {
    var ax1 = segment[0][0];
    var ax2 = segment[1][0];
    var ay1 = segment[0][1];
    var ay2 = segment[1][1];
    var bx1 = point[0];
    var bx2 = 0;
    var by1 = point[1];
    var by2 = point[1];

    var v1 = (bx2-bx1)*(ay1-by1)-(by2-by1)*(ax1-bx1);
    var v2 = (bx2-bx1)*(ay2-by1)-(by2-by1)*(ax2-bx1);
    var v3= (ax2-ax1)*(by1-ay1)-(ay2-ay1)*(bx1-ax1);
    var v4= (ax2-ax1)*(by2-ay1)-(ay2-ay1)*(bx2-ax1);

    return (v1*v2<0) && (v3*v4<0);
}

function getCrossesSegment(segment1, segment2) {
    var x1 = segment1[0][0];
    var x2 = segment1[1][0];
    var x3 = segment2[0][0];
    var x4 = segment2[1][0];

    var y1 = segment1[0][1];
    var y2 = segment1[1][1];
    var y3 = segment2[0][1];
    var y4 = segment2[1][1];

    var Ua=((x4-x3)*(y1-y3)-(y4-y3)*(x1-x3))/((y4-y3)*(x2-x1)-(x4-x3)*(y2-y1));
    var Ub=((x2-x1)*(y1-y3)-(y2-y1)*(x1-x3))/((y4-y3)*(x2-x1)-(x4-x3)*(y2-y1));

    var x=x3+Ub*(x4-x3);
    var y=y3+Ub*(y4-y3);

    return [[x, y], Ua, Ub]
}


var s1 = [[1, 1], [2, 2]];
var s2 = [[5, 1], [2, 2]];

function segmentsCrosses(segment1, segment2) {
    var x1 = segment1[0][0];
    var x2 = segment1[1][0];
    var x3 = segment2[0][0];
    var x4 = segment2[1][0];

    var y1 = segment1[0][1];
    var y2 = segment1[1][1];
    var y3 = segment2[0][1];
    var y4 = segment2[1][1];

    var Ua=((x4-x3)*(y1-y3)-(y4-y3)*(x1-x3))/((y4-y3)*(x2-x1)-(x4-x3)*(y2-y1));
    var Ub=((x2-x1)*(y1-y3)-(y2-y1)*(x1-x3))/((y4-y3)*(x2-x1)-(x4-x3)*(y2-y1));


    return (0 <= Ua && Ua <= 1 && 0 <= Ub && Ub <= 1);
}

function getCrossPoint(segment1, segment2) {
    var x1 = segment1[0][0];
    var x2 = segment1[1][0];
    var x3 = segment2[0][0];
    var x4 = segment2[1][0];

    var y1 = segment1[0][1];
    var y2 = segment1[1][1];
    var y3 = segment2[0][1];
    var y4 = segment2[1][1];


    var aCH = ((x4-x3)*(y1-y3)-(y4-y3)*(x1-x3));
    var aZN = ((y4-y3)*(x2-x1)-(x4-x3)*(y2-y1));
    var bCH = ((x2-x1)*(y1-y3)-(y2-y1)*(x1-x3));
    var bZN = ((y4-y3)*(x2-x1)-(x4-x3)*(y2-y1));

    if (aZN == 0) {
        return null;
    }

    var Ua=aCH/aZN;
    var Ub=bCH/bZN;

    var cross = (0 < Ua && Ua < 1 && 0 < Ub && Ub < 1);

    if (!cross) {
        return null;
    }

    var x = x1 + Ua * (x2 - x1);
    var y = y1 + Ua * (y2 - y1);


    return [x, y];
}

function pointFromArea(point, area) {
    var crossCount = 0;
    var pointSegment = [point, [0, point[1]]];
    for (var i = 0; i < area.length; i++) {
        var point1 = area[i];
        var point2 = area[i + 1] || area[0];

        var segmentOfArea = [point1, point2];

        if (segmentsCrosses(segmentOfArea, pointSegment)) {
            crossCount++;
        }
    }
    return Boolean(crossCount % 2);
}

function isOnePoint(point1, point2) {
    return point1[0] == point2[0] && point1[1] == point2[1];
}

function joinPoints(area1, area2) {
    // Check 3 equal areas
    var area2Equal = 0;
    for (var k = 0; k < area2.length - 1; k++) {
        if (area2[k][2]) {
            area2Equal++;
        }
    }
    if (area2Equal == area2.length - 1) {
        return area1;
    }

    var MAX = 1000;
    var count = 0;

    var result = [];
    var currentArea = null;
    var checkingArea = null;
    var position = 0;

    if (area1[0][2] && area2[1][1] > area1[1][1]) {
        currentArea = area2;
        checkingArea = area1;
        result.push(currentArea[0]);
        position = 0;

    } else {
        currentArea = area1;
        checkingArea = area2;
        result.push(currentArea[0]);
        position = 0;
    }

    var final = true;
    do {
        position++;
        var currentPoint = currentArea[position];
        result.push(currentPoint);

        if (currentPoint[1] == 0) {
            final = true;
            break;
        }

        var find = false;
        for (var i = 0; i < checkingArea.length; i++) {
            if (find) {
                continue
            }
            if (isOnePoint(currentPoint, checkingArea[i])) {
                find = true;
                var oldCurrent = currentArea;
                currentArea = checkingArea;
                checkingArea = oldCurrent;
                position = i;
            }
        }
        // STOTOG
        count++;
        if (MAX == count) {
            final = false;
            throw "MAX!!!";
        }
    } while (final);
    return result;
}

function joinCrossAreas(area1, area2) {
    var newArea1 = [];
    var newArea2AdditionPoints = [];

    for (var i = 0; i < area1.length; i++) {
        newArea1.push(area1[i]);
        var segment1 = [
            area1[i],
            area1[i + 1] || area1[0]
        ];

        for (var j = 0; j < area2.length; j++) {
            var segment2 = [
                area2[j],
                area2[j + 1] || area2[0]
            ];
            var crossPoint = getCrossPoint(segment1, segment2);
            if (crossPoint) {
                newArea1.push(crossPoint);
                newArea2AdditionPoints.push([j, crossPoint]);
            }
        }
    }

    for (var k = newArea2AdditionPoints.length - 1; k >= 0; k--) {
        var point = newArea2AdditionPoints[k][1];
        var position = newArea2AdditionPoints[k][0]
        area2.splice(position + 1, 0, point);
    }

    return joinPoints(newArea1, area2)
}

function amountAreas(area1, area2) {
    var isCross = false;

    for (var i = 0; i < area1.length; i++) {
        var pointInArea2 = pointFromArea(area1[i], area2);
        if (pointInArea2) {
            area1[i].push(true);
            isCross = true;
        }
    }

    for (var j = 0; j < area2.length; j++) {
        var pointInArea1 = pointFromArea(area2[j], area1);
        if (pointInArea1) {
            area2[j].push(true);
            isCross = true;
        }
    }

    if (!isCross) {
        return [area1, area2];
    } else {
        var jn = joinCrossAreas(area1, area2);
        return [jn]
    }
}

function drawContourByFigures(list) {
    var points = [];

    for (var i = 0; i < list.length; i++) {
        var area = list[i];
        for (var j = 0; j < area.length; j++) {
            points.push(area[j]);
        }
    }

    drawLine(points);
}

function contour(builds) {
    var rectList = getRectList(builds);
    rectList.sort(function(a, b){
        if (a[0][0] > b[0][0]) return 1;
        if (a[0][0] < b[0][0]) return -1;
        return 0;
    });

    var drawingFigures = [rectList[0]];

    for (var i = 1; i < rectList.length; i++) {
        var area0 = drawingFigures[drawingFigures.length - 1];
        var area1 = rectList[i];

        var amount = amountAreas(area0, area1);

        if (amount.length > 1) {
            drawingFigures.push(amount[1]);
        } else {
            drawingFigures[drawingFigures.length - 1] = amount[0]
        }
    }

    drawContourByFigures(drawingFigures);
}


function getRectList(builds) {
    var result = [];

    for (var i = 0; i < builds.length; i++) {
        result.push([
            [builds[i][0], 0],
            [builds[i][0], builds[i][1]],
            [builds[i][0] + builds[i][2], builds[i][1]],
            [builds[i][0] + builds[i][2], 0]
        ])
    }

    return result;
}

/*
 * Default data
 */
var builds = [
    [220, 140, 50, 'red'],
    [220, 110, 70, 'green'],
    [200, 70, 400, 'orange'],
    [420, 160, 20, 'gold'],
    [740, 20, 10],
    [230, 30, 30.4],
    [10, 20.4, 50],

    [61, 70, 50],
    [171, 30, 30]
]

drawBuilds(builds);
contour(builds);





































































