var CANVAS_HEIGHT = 500;
var CANVAS_WIDTH = 1000;
var canvas = document.getElementById('canvas');

function getRectList(builds) {
    var result = [];

    for (var i = 0; i < builds.length; i++) {
        result.push([
            [builds[i][0], 0],
            [builds[i][0], builds[i][2]],
            [builds[i][1], builds[i][2]],
            [builds[i][1], 0]
        ]);
    }

    return result;
}

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
        var y = CANVAS_HEIGHT - builds[i][2];
        var w = builds[i][1] - builds[i][0];
        var h = builds[i][2];
        context.rect(x, y, w, h);

        context.lineWidth = 1;
        context.strokeStyle = 'black';
        context.stroke();
    }
}

/**
 * Algorithm
 */
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

    var cross = (0 <= Ua && Ua <= 1 && 0 <= Ub && Ub <= 1);

    if (!cross) {
        return null;
    }

    var x = x1 + Ua * (x2 - x1);
    var y = y1 + Ua * (y2 - y1);

    return [x, y];
}

function isOnePoint(point1, point2) {
    return point1[0] == point2[0] && point1[1] == point2[1];
}

function isPositiveAngle(center, point1, point2) {
    var x1 = point1[0] - center[0],
        y1 = point1[1] - center[1];
    var x2 = point2[0] - center[0],
        y2 = point2[1] - center[1];

    var angle = Math.atan(y2 - y1, x2 - x1) / Math.PI * 180;
    return angle > 0;
}

function joinPoints(area1, area2) {
    var result = [area1[0]];
    var currentArea = area1;
    var checkingArea = area2;
    var index = 0;
    var currentPoint = currentArea[index];

    var MAX = 1000;
    var count = 0;
    do {
        index++;
        var nextCurrent = currentArea[index];
        var nextChecking = null;
        var checkingIndex = null;

        dance:
        for (var i = 0; i < checkingArea.length; i++) {
            if (isOnePoint(currentPoint, checkingArea[i])) {
                checkingIndex = i;

                nextChecking = checkingArea[i + 1];
                break dance;
            }
        }

        if (nextChecking && isPositiveAngle(currentPoint, nextCurrent, nextChecking)) {
            currentPoint = nextChecking;

            var oldCurrent = currentArea;
            currentArea = checkingArea;
            checkingArea = oldCurrent;
            index = checkingIndex
        } else {
            currentPoint = nextCurrent;
        }

        result.push(currentPoint);

        // STOTOG
        count++;
        if (MAX == count) {
            currentPoint[1] = 0;
            throw Error("MAX count");
        }
    } while (currentPoint[1] != 0);

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
                if (!isOnePoint(crossPoint, segment1[0]) && !isOnePoint(crossPoint, segment1[1])) {
                    newArea1.push(crossPoint);
                }
                if (!isOnePoint(crossPoint, segment2[0]) && !isOnePoint(crossPoint, segment2[1])) {
                    newArea2AdditionPoints.push([j, crossPoint]);
                }
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
    var area1X1 = area1[0][0];
    var area2X1 = area2[0][0];
    var area1XLast = area1[area1.length - 1][0];

    if (area1X1 <= area2X1 && area2X1 <= area1XLast) {
        return [joinCrossAreas(area1, area2)];
    } else {
        return [area1, area2];
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

/*
 * Default data
 */
function getRandomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomBuild() {
    var MIN_WIDTH = 30;
    var MIN_HEIGHT = 2

    var x1 = getRandomInt(MIN_WIDTH, CANVAS_WIDTH - MIN_WIDTH);
    var x2 = getRandomInt(x1 + MIN_WIDTH, CANVAS_WIDTH - MIN_WIDTH);
    var height = getRandomInt(MIN_HEIGHT, CANVAS_HEIGHT - MIN_HEIGHT);

    return [x1, x2, height];
}

function random() {
    var builds = [];

    var inputValue = document.getElementById('val').value;
    if (inputValue) {
        builds = JSON.parse(inputValue);
    } else {
        for (var i = 0; i < 5; i++) {
            builds.push(getRandomBuild());
        }
    }

    var context = canvas.getContext('2d');
    context.clearRect (0 , 0 , CANVAS_WIDTH, CANVAS_HEIGHT);
    context.restore();
    contour(builds);
    drawBuilds(builds);

    document.getElementById('c').innerHTML = JSON.stringify(builds);
}

random();






































































