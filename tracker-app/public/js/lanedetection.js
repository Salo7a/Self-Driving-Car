console.log('from lane file');

const showImage = (canvasTag, matData) => {
    cv.imshow(canvasTag, matData);
} 

const showImageBGR = (canvasTag, matData) => {
    // cv.cvtColor(matData, matData, cv.COLOR_BGR2RGB);
    showImage(canvasTag, matData);
    // showImage(canvasTag, cv.cvtColor(matData, cv.COLOR_BGR2RGB, 0));
}

 function detectEdges (frame, lowerColor, upperColor) {
    // debugger;
    let hsv = new cv.Mat();
    let mask = new cv.Mat();
    let edges = new cv.Mat();
    let res = new cv.Mat();
    let lowerBlue;
    let upperBlue;
    try {
        // Transform into HSV
        cv.cvtColor(frame, hsv, cv.COLOR_RGB2HSV);
        let lowScalar = new cv.Scalar(60,40,40, 255);
        let highScalar = new cv.Scalar(150, 255, 255, 255);
        // let lowScalar = new cv.Scalar(0, 0, 168, 255);
        // let highScalar = new cv.Scalar(172, 111, 125, 255);
        console.log(frame.type())
        lowerBlue = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), lowScalar);
        upperBlue = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), highScalar);
    } catch (err) {
        console.error();
        console.log(err);
    }

    try {
        // Threshold the HSV image to get only the white
        cv.inRange(hsv, lowerBlue, upperBlue, mask);

    } catch (err) {
        console.error();
        console.log(err);
    }
    console.log(mask);
    // Bitwise-AND mask and original image
    // cv.bitwise_and(frame, frame,mask, res);

    // Detect edges
     cv.Canny(mask, edges, 200, 400)
    return {hsvMat: hsv, maskMat: mask, edgesMat: edges};

    // return edges
}

function detectLineSegments(croppedEdges){
    let arr = new cv.Scalar();
    let rho = 1;  // distance precision in pixel, i.e. 1 pixel
    let angle = Math.PI / 180;  // angular precision in radian, i.e. 1 degree
    let minThreshold = 10;  // minimal of votes
    let lineSegments = new cv.Mat();
    cv.HoughLinesP(croppedEdges, lineSegments, rho, angle, minThreshold , minLineLength=8, maxLineGap=4)
    return lineSegments
}
function averageSlopeIntercept(frame, lineSegments)
{
    let laneLines = []
    if (!lineSegments) {
        console.log('No lineSegment segments detected');
        return laneLines;
    }


    let {height, width} = frame.size()
    let leftFit = []
    let rightFit = []
    console.log(lineSegments.channels());
    let boundary = 1/3
    let leftRegionBoundary = width * (1 - boundary);
    let rightRegionBoundary = width * boundary;
    let lines = new cv.Mat();
    let lineSegment;
    let xx = lineSegments.reshape(4);
    console.log(xx);
    // for (let i = 0; i < lineSegments.rows; ++i) {
    //     let startPoint = new cv.Point(lines.data32S[i * 4], lines.data32S[i * 4 + 1]);
    //     let endPoint = new cv.Point(lines.data32S[i * 4 + 2], lines.data32S[i * 4 + 3]);
    //     cv.line(dst, startPoint, endPoint, color);
    // }
    for (let i = 0; i < lineSegments.rows; ++i){
        console.log("Seg: " + lineSegment);
        for (lin in lineSegment)
        {
            console.log("lin: " + lin);
            console.log(lineSegments.data32S[i * 4])
            console.log(lineSegments.data32S[i * 4 + 1])
            //     let endPoint = new cv.Point(lines.data32S[i * 4 + 2], lines.data32S[i * 4 + 3]);
            // if (lin.x1 == lin.x2){
            //    console.log('skipping vertical line segment (slope=inf)'+ lineSegment)
            // }
            //
            //
            // let fit = cv.polyfit((lin.x1, lin.x2), (lin.y1, lin.y2), 1)
            // let slope = fit[0]
            // let intercept = fit[1]
            // if (slope < 0){
            //     if (x1 < leftRegionBoundary && x2 < leftRegionBoundary)
            //     {
            //         leftFit.append((slope, intercept))
            //     }
            //
            // }
            //
            // else {
            //         if (x1 > rightRegionBoundary && x2 > rightRegionBoundary)
            //         {
            //             rightFit.append((slope, intercept))
            //         }
            //
            //     }
            //
            }
    }
    // let leftFitAverage = np.average(leftFit, axis=0)
    // if (len(leftFit) > 0) {
    //     laneLines.append(makePoints(frame, leftFitAverage))
    // }
    //
    //
    // let rightFitAverage = np.average(rightFit, axis=0)
    // if (len(rightFit) > 0) {
    //     laneLines.append(makePoints(frame, rightFitAverage))
    // }
    //
    //
    // console.log('lane lines: ' + laneLines);

    return laneLines
}
// # tuning minThreshold, minLineLength, maxLineGap is a trial and error process by hand
// const regionOfInterest = (edges) => {
//     height, width = edges.shape
//     // mask = np.zeros_like(edges)
//     // mask = cv.Mat.zeros(height, width);

//     // only focus bottom half of the screen
//     polygon = np.array([[
//         (0, height * 1 / 2),
//         (width, height * 1 / 2),
//         (width, height),
//         (0, height),
//     ]], np.int32)

//     cv.fillPoly(mask, polygon, 255)
//     croppedEdges = cv.bitwise_and(edges, mask)
//     return croppedEdges
// }

// const detectLineSegments = (croppedEdges) => {

//     // tuning minThreshold, minLineLength, maxLineGap is a trial and error process by hand
//     rho = 1  // distance precision in pixel, i.e. 1 pixel
//     angle = np.pi / 180  // angular precision in radian, i.e. 1 degree
//     minThreshold = 10  // minimal of votes
//     lineSegments = cv.HoughLinesP(croppedEdges, rho, angle, minThreshold, np.array([]), minLineLength=8, maxLineGap=4)

//     return lineSegments
// }

// const makePoints = () => {
//     height, width, _ = frame.shape
//     slope, intercept = line
//     y1 = height  // bottom of the frame
//     // y2 = int(y1 * 1 / 2)  // make points from middle of the frame down
//     y2 = (y1 * 1 / 2)  // make points from middle of the frame down

//     // bound the coordinates within the frame
//     x1 = Math.max(-width, Math.min(2 * width, int((y1 - intercept) / slope)))
//     x2 = Math.max(-width, Math.min(2 * width, int((y2 - intercept) / slope)))
//     return [[x1, y1, x2, y2]]
// }


module.exports = {
    detectEdges, showImage, showImageBGR,detectLineSegments, averageSlopeIntercept
}