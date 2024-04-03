# 

import sys
import numpy as np
import pickle
import json
import warnings
from sklearn.exceptions import InconsistentVersionWarning

# Suppress scikit-learn version mismatch warnings
warnings.filterwarnings("ignore", category=InconsistentVersionWarning)

# Load the machine learning model and PCA transformer
classifier = pickle.load(open('D:/Downloads/apk-inspector/apk-inspector-0.1.0/svm_model_pca.pkl', 'rb'))
pca = pickle.load(open("D:/Downloads/apk-inspector/apk-inspector-0.1.0/pca.pkl", 'rb'))

def predict_malicious(array_data):
    # Transform input array using PCA
    input_query = np.array([array_data])
    input_pca = pca.transform(input_query)
    
    # Predict using the machine learning model
    result = classifier.predict(input_pca)[0]
    return result

if __name__ == "__main__":
    try:
        # Accept input data from command-line arguments
        permissions = json.loads(sys.argv[1])
        
        # Perform prediction
        prediction = predict_malicious(permissions)
        
        # Print the prediction result
        print(prediction)
    except Exception as e:
        print("Error:", e)
