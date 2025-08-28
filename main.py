# from fastapi import FastAPI
# from pydantic import BaseModel
# from typing import List
# import joblib

# app = FastAPI()

# model = joblib.load("weather_pipeline_3.pkl")

# from fastapi.middleware.cors import CORSMiddleware

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# class WeatherFeatures(BaseModel):
#     BASEL_temp_mean_lag1: float
#     BASEL_temp_mean_lag3: float
#     BASEL_temp_mean_lag7: float
#     BASEL_temp_mean_roll7: float
#     month: int
#     dayofyear: int
 

# @app.get("/")
# def root():
#     return {"message": "Weather Prediction API is running"}


# @app.post("/predict")
# def predict(features: WeatherFeatures):
#     data = [[
#         features.BASEL_temp_mean_lag1,
#         features.BASEL_temp_mean_lag3,
#         features.BASEL_temp_mean_lag7,
#         features.BASEL_temp_mean_roll7,
#         features.month,
#         features.dayofyear
#     ]]
#     prediction = model.predict(data)[0]
#     return {"predicted_temperature": round(float(prediction), 2)}

# ADDITIONAL 
# class WeatherBatch(BaseModel):
#     data: List[WeatherFeatures]

# @app.post("/batch_predict")
# def batch_predict(batch: WeatherBatch):
#     data = [[f.BASEL_temp_mean_lag1,
#              f.BASEL_temp_mean_lag3,
#              f.BASEL_temp_mean_lag7,
#              f.BASEL_temp_mean_roll7,
#              f.month,
#              f.dayofyear] for f in batch.data]
#     predictions = model.predict(data).tolist()
#     return {"predicted_temperatures": predictions}

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from typing import List
import joblib

# Initialize FastAPI app
app = FastAPI(
    title="Weather Temperature Prediction API",
    description="ML-powered temperature prediction service for Basel, Switzerland",
    version="1.0.0"
)

# Load the pre-trained model
model = joblib.load("weather_pipeline_3.pkl")

# CORS middleware for API access
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files (CSS, JS, images)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Set up templates directory for HTML files
templates = Jinja2Templates(directory="templates")

# Pydantic model for weather features
class WeatherFeatures(BaseModel):
    BASEL_temp_mean_lag1: float
    BASEL_temp_mean_lag3: float
    BASEL_temp_mean_lag7: float
    BASEL_temp_mean_roll7: float
    month: int
    dayofyear: int

# Routes

@app.get("/", response_class=HTMLResponse)
async def get_homepage(request: Request):
    """Serve the main prediction interface"""
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/api", response_class=HTMLResponse) 
async def get_api_info():
    """Basic API information endpoint"""
    return {"message": "Weather Prediction API is running", "version": "1.0.0", "status": "healthy"}

@app.post("/predict")
async def predict_temperature(features: WeatherFeatures):
    """
    Predict temperature based on historical weather data and temporal features.
    
    Args:
        features: WeatherFeatures object containing:
            - BASEL_temp_mean_lag1: Temperature 1 day ago (°C)
            - BASEL_temp_mean_lag3: Temperature 3 days ago (°C) 
            - BASEL_temp_mean_lag7: Temperature 7 days ago (°C)
            - BASEL_temp_mean_roll7: 7-day rolling average temperature (°C)
            - month: Month of the year (1-12)
            - dayofyear: Day of the year (1-366)
    
    Returns:
        dict: Predicted temperature in Celsius
    """
    try:
        # Prepare data for model prediction
        data = [[
            features.BASEL_temp_mean_lag1,
            features.BASEL_temp_mean_lag3,
            features.BASEL_temp_mean_lag7,
            features.BASEL_temp_mean_roll7,
            features.month,
            features.dayofyear
        ]]
        
        # Make prediction
        prediction = model.predict(data)[0]
        
        # Return result
        return {
            "predicted_temperature": round(float(prediction), 2),
            "status": "success",
            "model_info": "Support Vector Regression (SVR) trained on Basel weather data"
        }
        
    except Exception as e:
        return {
            "error": str(e),
            "status": "error",
            "predicted_temperature": None
        }

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "service": "Weather Temperature Prediction API",
        "model_loaded": model is not None
    }

# Additional batch prediction endpoint
class WeatherBatch(BaseModel):
    data: List[WeatherFeatures]

@app.post("/batch_predict")
async def batch_predict_temperatures(batch: WeatherBatch):
    """
    Predict temperatures for multiple data points.
    
    Args:
        batch: WeatherBatch object containing list of WeatherFeatures
        
    Returns:
        dict: List of predicted temperatures
    """
    try:
        # Prepare data for batch prediction
        data = [[
            f.BASEL_temp_mean_lag1,
            f.BASEL_temp_mean_lag3,
            f.BASEL_temp_mean_lag7,
            f.BASEL_temp_mean_roll7,
            f.month,
            f.dayofyear
        ] for f in batch.data]
        
        # Make predictions
        predictions = model.predict(data).tolist()
        
        # Round predictions to 2 decimal places
        rounded_predictions = [round(pred, 2) for pred in predictions]
        
        return {
            "predicted_temperatures": rounded_predictions,
            "status": "success",
            "count": len(rounded_predictions)
        }
        
    except Exception as e:
        return {
            "error": str(e),
            "status": "error",
            "predicted_temperatures": []
        }

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
