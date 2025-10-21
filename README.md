# Weather and Temperature Prediction 🌦️

This project uses machine learning to forecast weather conditions and predict temperatures based on historical meteorological data. It employs a Random Forest model, a powerful ensemble learning method well-suited for complex regression and classification tasks like weather prediction.​

The trained model is deployed using a FastAPI backend, which provides a simple and efficient RESTful API to get predictions.

### Live Link : https://temprature-prediction.onrender.com

## Features

Temperature Prediction: Utilizes a Random Forest Regressor to predict future temperature values with high accuracy.​

Weather Condition Forecasting: Classifies weather into different categories (e.g., Sunny, Rainy, Cloudy) using historical data patterns.​

Data-Driven Insights: The model is trained on historical weather data, learning from features like humidity, wind speed, pressure, and cloud cover to make its predictions.​

RESTful API: A high-performance API built with FastAPI allows for easy integration and provides predictions through a simple endpoint.​

Interactive API Documentation: Comes with auto-generated, interactive API documentation powered by Swagger UI and ReDoc.


<img width="1077" height="888" alt="image" src="https://github.com/user-attachments/assets/d4a40111-b43c-4f71-b45d-8271dafb3d1e" />


## Tech Stack

Backend: Python, FastAPI

Machine Learning: Scikit-learn, Pandas, NumPy

Web Server: Uvicorn

Data Visualization: Matplotlib, Seaborn (for analysis and model evaluation)

## How It Works

The system operates through the following stages:

Data Collection & Cleaning: Historical weather data is loaded and preprocessed to handle missing values and prepare it for the model.​

Exploratory Data Analysis (EDA): The dataset is analyzed to understand relationships between different weather variables and to inform feature selection.​

Model Training: A Random Forest model is trained on the cleaned dataset. 80% of the data is typically used for training and 20% for testing.​

API Deployment: The trained model is integrated into a FastAPI application, which exposes a /predict endpoint.​

Prediction: A user can send a request to the API with current weather parameters (e.g., humidity, wind speed), and the model returns a prediction for the temperature and weather condition.

## Getting Started
To set up the project locally, please follow these instructions.

### Prerequisites

Python 3.9+
Git

### Installation & Setup
### Clone the repository:
```
bash
git clone https://github.com/anas-fareedi/weather-and-temprature-prediction.git
cd weather-and-temprature-prediction
```
### Create and activate a virtual environment:
```
bash
# For Windows
python -m venv venv
.\venv\Scripts\activate
```
### Install the required dependencies:
```
bash
pip install -r requirements.txt
```
### Prepare the Dataset:

Ensure your weather dataset (e.g., weather.csv) is placed in the project's root or a data/ directory.​

### Train the Model (if needed):
Run the training script (e.g., train.py) to generate the model file if it's not already provided. This will save the trained model as a .pkl file.

### Run the Application:
Start the FastAPI server using Uvicorn.
```
bash
uvicorn main:app --reload
The API will be available at http://127.0.0.1:8000.
```

### API Documentation

Once the application is running, you can access and interact with the API documentation at:
```
Swagger UI: http://127.0.0.1:8000/docs
ReDoc: http://127.0.0.1:8000/redoc
```
Here, you can test the prediction endpoint by providing the necessary input features.

### Contributing

#### Contributions are what make the open-source community such an amazing place to create, learn, and inspire. Any contributions you make are greatly appreciated.

1 Fork the Project.
2 Create your Feature Branch (git checkout -b feature/NewFeature).
3 Commit your Changes (git commit -m 'Add some NewFeature').
4 Push to the Branch (git push origin feature/NewFeature).
5 Open a Pull Request.
