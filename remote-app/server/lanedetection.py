# Simple loader script
import sys 
import base64
import numpy as np
import cv2

# for arg in (sys.argv):
#     print(arg)

def data_uri_to_cv2_img(uri):
    encoded_data = uri.split(',')[1]
    nparr = np.fromstring(base64.b64decode(encoded_data), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

imgURI = sys.argv[1]
imgData = data_uri_to_cv2_img(imgURI)
# cv2.imshow('Frame', imgData)
# cv2.waitKey(0)
# cv2.destroyAllWindows()




# Processing

