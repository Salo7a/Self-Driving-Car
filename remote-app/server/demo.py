# Simple loader script
import sys
import cv2

imgFile = sys.argv[1]

imgData = cv2.imread(imgFile)
print(imgData)
print(imgData.shape)
cv2.imshow('image', imgData)
cv2.waitKey(0)
cv2.destroyAllWindows()
