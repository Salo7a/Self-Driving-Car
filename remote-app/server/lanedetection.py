# Simple loader script, loads the saved model from the notebook

import sys 


# model file name 
# filename = 'model.joblib'
# filename = sys.argv[1]

# Get the strengths values 
vals = [float(i) for i in sys.argv[1:]]


def predict(vals, filename):
    return [vals]*2


