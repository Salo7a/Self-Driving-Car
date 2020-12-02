import sys 
import base64
import numpy as np
import cv2
import matplotlib.pyplot as plt
import math
from PIL import Image
from io import BytesIO


# for arg in (sys.argv):
#     print(arg)


def data_uri_to_cv2_img(uri):
    """
    Decodes the uri of incoming image
    """
    encoded_data = uri.split(',')[1]
    nparr = np.fromstring(base64.b64decode(encoded_data), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img


# Helper functions for displaying


def showImage(image, title): 
    plt.figure()
    plt.title(title)
    plt.imshow(image)
    plt.xticks([]), plt.yticks([])
    plt.show()


def showImageBGR(image, title):
    showImage(cv2.cvtColor(image, cv2.COLOR_BGR2RGB), title)


# DETECTION FUNCTIONS


def detectEdges(frame, lowerColor, upperColor):
    # Transform into HSV
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

    # Threshold the HSV image to get only the white
    mask = cv2.inRange(hsv, lowerColor, upperColor)
    # Bitwise-AND mask and original image
    # res = cv2.bitwise_and(frame, frame, mask= mask)

    # Detect edges
    edges = cv2.Canny(mask, 200, 400)

    return edges


def regionOfInterest(edges):
    height, width = edges.shape
    mask = np.zeros_like(edges)

    # only focus bottom half of the screen
    polygon = np.array([[
        (0, height * 1 / 2),
        (width, height * 1 / 2),
        (width, height),
        (0, height),
    ]], np.int32)

    cv2.fillPoly(mask, polygon, 255)
    croppedEdges = cv2.bitwise_and(edges, mask)
    return croppedEdges


def detectLineSegments(croppedEdges):
    # tuning minThreshold, minLineLength, maxLineGap is a trial and error process by hand
    rho = 1  # distance precision in pixel, i.e. 1 pixel
    angle = np.pi / 180  # angular precision in radian, i.e. 1 degree
    minThreshold = 10  # minimal of votes
    lineSegments = cv2.HoughLinesP(croppedEdges, rho, angle, minThreshold, np.array([]), minLineLength=8, maxLineGap=4)

    return lineSegments


def makePoints(frame, line):
    height, width, _ = frame.shape
    slope, intercept = line
    y1 = height  # bottom of the frame
    y2 = int(y1 * 1 / 2)  # make points from middle of the frame down

    # bound the coordinates within the frame
    x1 = max(-width, min(2 * width, int((y1 - intercept) / slope)))
    x2 = max(-width, min(2 * width, int((y2 - intercept) / slope)))
    return [[x1, y1, x2, y2]]


def averageSlopeIntercept(frame, lineSegments):
    """
    This function combines line segments into one or two lane lines
    If all line slopes are < 0: then we only have detected left lane
    If all line slopes are > 0: then we only have detected right lane
    """
    laneLines = []
    if lineSegments is None:
        # print('No lineSegment segments detected')
        #MAKE CAR STOP?
        return laneLines

    height, width, _ = frame.shape
    leftFit = []
    rightFit = []

    boundary = 1/3
    leftRegionBoundary = width * (1 - boundary)  # left lane line segment should be on left 2/3 of the screen
    rightRegionBoundary = width * boundary  # right lane line segment should be on right 2/3 of the screen

    for lineSegment in lineSegments:
        for x1, y1, x2, y2 in lineSegment:
            if x1 == x2:
                # print('skipping vertical line segment (slope=inf): ' , lineSegment)
                continue
            fit = np.polyfit((x1, x2), (y1, y2), 1) # Least squares polynomial fit of the first degree.
            slope = fit[0]
            intercept = fit[1]
            if slope < 0:
                if x1 < leftRegionBoundary and x2 < leftRegionBoundary:
                    leftFit.append((slope, intercept))
            else:
                if x1 > rightRegionBoundary and x2 > rightRegionBoundary:
                    rightFit.append((slope, intercept))

    leftFitAverage = np.average(leftFit, axis=0)
    if len(leftFit) > 0:
        laneLines.append(makePoints(frame, leftFitAverage))

    rightFitAverage = np.average(rightFit, axis=0)
    if len(rightFit) > 0:
        laneLines.append(makePoints(frame, rightFitAverage))

    # print('lane lines: ', laneLines)  # [[[316, 720, 484, 432]], [[1009, 720, 718, 432]]]

    return laneLines


def detectLane(frame, lowerColor, upperColor):
    edges = detectEdges(frame, lowerColor, upperColor)
    croppedEdges = regionOfInterest(edges)
    # croppedEdges = edges
    lineSegments = detectLineSegments(croppedEdges)
    laneLines = averageSlopeIntercept(frame, lineSegments)

    return laneLines


def displayLines(frame, lines, lineColor = (0,255,0), lineWidth = 20):
    lineImage = np.zeros_like(frame)
    if lines is not None:
        for line in lines:
            for x1, y1, x2, y2 in line:
                cv2.line(lineImage, (x1, y1), (x2, y2), lineColor, lineWidth)
    lineImage = cv2.addWeighted(frame, 0.8, lineImage, 1, 1)
    return lineImage




#---------------------------------------------------------------!
#STEERING FUNCTIONS


def computeSteeringAngle(frame, laneLines):
    """ Find the steering angle based on lane line coordinate
        We assume that camera is calibrated to point to dead center
    """
    if len(laneLines) == 0:
        # print('No lane lines detected, do nothing')
        #MAKE CAR STOP?
        return -90

    # Get middle line in case of detecting single lane
    height, width, _ = frame.shape
    if len(laneLines) == 1:
        # print('Only detected one lane line, just follow it. ', laneLines[0])
        x1, _, x2, _ = laneLines[0][0]
        x_offset = x2 - x1
    else:   # get middle line in case of detecting two lanes
        _, _, left_x2, _ = laneLines[0][0]
        _, _, right_x2, _ = laneLines[1][0]
        cameraMidOffsetPercent = 0.00 # 0.0 means car pointing to center, -0.03: car is centered to left, +0.03 means car pointing to right
        mid = int(width / 2 * (1 + cameraMidOffsetPercent))
        x_offset = (left_x2 + right_x2) / 2 - mid

    # find the steering angle, which is angle between navigation direction to end of center line
    y_offset = int(height / 2)

    angleToMidRadian = math.atan(x_offset / y_offset)  # angle (in radian) to center vertical line
    angleToMidDeg = int(angleToMidRadian * 180.0 / math.pi)  # angle (in degrees) to center vertical line
    steeringAngle = angleToMidDeg + 90  # this is the steering angle needed by picar front wheel

    # print('new steering angle: ', steeringAngle)
    return steeringAngle


def stabilizeSteeringAngle(currSteeringAngle, newSteeringAngle, numOfLaneLines, maxAngleDeviationTwoLines=5, maxAngleDeviationOneLane=1):
    """
    Using last steering angle to stabilize the steering angle
    This can be improved to use last N angles, etc
    if new angle is too different from current angle, only turn by maxAngleDeviation degrees
    """
    if numOfLaneLines == 2 :
        # if both lane lines detected, then we can deviate more
        maxAngleDeviation = maxAngleDeviationTwoLines
    else :
        # if only one lane detected, don't deviate too much
        maxAngleDeviation = maxAngleDeviationOneLane
    
    angleDeviation = newSteeringAngle - currSteeringAngle
    if abs(angleDeviation) > maxAngleDeviation:
        stabilizedSteeringAngle = int(currSteeringAngle + maxAngleDeviation * angleDeviation / abs(angleDeviation))
    else:
        stabilizedSteeringAngle = newSteeringAngle
    # print('Proposed angle: ',newSteeringAngle, ', stabilized angle: ' ,stabilizedSteeringAngle)
    return stabilizedSteeringAngle


def displayHeadingLine(frame, steeringAngle, lineColor=(0, 0, 255), lineWidth=15):
    headingImage = np.zeros_like(frame)
    height, width, _ = frame.shape

    # figure out the heading line from steering angle
    # heading line (x1,y1) is always center bottom of the screen
    # (x2, y2) requires a bit of trigonometry

    # Note: the steering angle of:(adjust boundaries based on car performance)
    # 0-89 degree: turn left
    # 90 degree: going straight
    # 91-180 degree: turn right 
    steeringAngleRadian = steeringAngle / 180.0 * math.pi
    x1 = int(width / 2)
    y1 = height
    x2 = int(x1 - height / 2 / math.tan(steeringAngleRadian))
    y2 = int(height / 2)

    cv2.line(headingImage, (x1, y1), (x2, y2), lineColor, lineWidth)
    headingImage = cv2.addWeighted(frame, 0.8, headingImage, 1, 1)

    return headingImage


# Choose Colors Range
#range of white in HSV
lowerWhite = np.array([0,0,168])
upperWhite = np.array([172,111,255])

# Range of Blue in HSV
# lowerBlue = np.array([60,40,40])
# upperBlue = np.array([150,255,255])

# Apply Processing
# img_path = "D:\Study\Courses\College\Electronics-Tasks-4th-Year/task3-sbe403a_f20_task3_03/remote-app/server/laneBlue1.jpg"
print(sys.argv[0])
frameURI = sys.argv[1]
frameTest = data_uri_to_cv2_img(frameURI)
# frameTest = cv2.imread(img_path)
laneLines = detectLane(frameTest, lowerWhite, upperWhite)
laneLinesImage = displayLines(frameTest, laneLines)

steeringAngle = computeSteeringAngle(frameTest, laneLines)
finalImage = displayHeadingLine(laneLinesImage, steeringAngle)

# showImageBGR(finalImage, "Final Image Lanes & Route")
# steeringAngle = 100
print(steeringAngle)
# print("laneLines: ", laneLines)

# converted = cv2.imencode('.jpg', finalImage)[1].toString()
# print(converted)

pil_img = Image.fromarray(finalImage)
buff = BytesIO()
pil_img.save(buff, format="JPEG")
converted_img = base64.b64encode(buff.getvalue()).decode("utf-8")
converted_img = "data:image/jpeg;base64," + converted_img
print(converted_img)