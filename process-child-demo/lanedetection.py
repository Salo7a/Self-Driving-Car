# Simple loader script, loads the saved model from the notebook

import sys 

# Get the strengths values
print("From Python File ...")
vals = [float(i) for i in sys.argv[1:]]

def predict(vals):
    return vals*2


val = predict(9)
print(val)