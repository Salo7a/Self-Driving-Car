from flask import Flask, jsonify, request, after_this_request
import urllib.parse
from lanedetection import *


app = Flask(__name__)

lowerColors, upperColors = ..., ...
color_name = "blue"

# Choose Colors Range
if color_name == "white":
    # range of white in HSV
    lowerColors = np.array([0, 0, 168])
    upperColors = np.array([172, 111, 255])
elif color_name == "blue":
    # Range of Blue in HSV
    lowerColors = np.array([60, 40, 40])
    upperColors = np.array([150, 255, 255])


@app.route('/')
def main():
    return "main Page"


# @app.route('/detect/<path:frameURI>')
# def process(frameURI):

@app.route('/detect')
def process():
    @after_this_request
    def add_header(response):
        # To allow CORS (Cross Origin Resource Sharing)
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response

    color = request.args.get('color')
    frameURI = request.args.get('frame_uri')
    print(color)

    frameTest = data_uri_to_cv2_img(frameURI)
    laneLines = detectLane(frameTest, lowerColors, upperColors)
    laneLinesImage = displayLines(frameTest, laneLines)

    steeringAngle = computeSteeringAngle(frameTest, laneLines)
    finalImage = displayHeadingLine(laneLinesImage, steeringAngle)
    finalImageRGB = convert_BGR_to_RGB(finalImage)
    finalImageRGBBase64 = img_to_data_uri(finalImageRGB)

    showImage(finalImageRGB, "Final Image in RGB Lanes & Route")

    resultJSON = {"angle": steeringAngle, "imgBase": finalImageRGBBase64}
    print(resultJSON["angle"])
    return jsonify(resultJSON)


if __name__ == '__main__':
    app.run(debug=True)