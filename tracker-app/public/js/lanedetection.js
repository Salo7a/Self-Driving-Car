console.log('from lane file');

const showImage = (canvasTag, matData) => {
    cv.imshow(canvasTag, matData);
} 

const showImageBGR = (canvasTag, matData) => {
    cv.cvtColor(matData, matData, cv.COLOR_BGR2RGB, 0); 
    showImage(canvasTag, matData);
    // showImage(canvasTag, cv.cvtColor(matData, cv.COLOR_BGR2RGB, 0));
}

function detectEdges (frame, lowerColor, upperColor) {
    // debugger;
    let hsv = new cv.Mat();
    let mask = new cv.Mat();
    let edges = new cv.Mat();
    let lowerWhite;
    let upperWhite;
    try {
        // Transform into HSV
        cv.cvtColor(frame, hsv, cv.COLOR_RGB2HSV);
        lowerWhite = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [0, 0, 0, 168]);
        upperWhite = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [172, 111, 125, 255]);
    } catch (err) {
        console.error();
        console.log(err);
    }

    try {
        // Threshold the HSV image to get only the white
        cv.inRange(hsv, lowerWhite, upperWhite, mask);
    } catch (err) {
        console.error();
        console.log(err);
    }
    // Bitwise-AND mask and original image
    // res = cv.bitwise_and(frame, frame, mask=mask)

    // Detect edges
    // edges = cv.Canny(mask, 200, 400)
    return {hsvMat: hsv, maskMat: mask, edgesMat: edges}

    // return edges
}

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
    detectEdges, showImage, showImageBGR
}