import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
API_KEY = os.getenv('sportmonk_API')

# Base URL for SportMonk API
BASE_URL = "https://api.sportmonks.com/v3/motorsport/formula1"

def get_f1_seasons():
    """Get all F1 seasons"""
    endpoint = f"{BASE_URL}/seasons"
    params = {
        "api_token": API_KEY
    }
    
    response = requests.get(endpoint, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        return f"Error: {response.status_code} - {response.text}"

def get_f1_races():
    """Get F1 races"""
    endpoint = f"{BASE_URL}/races"
    params = {
        "api_token": API_KEY
    }
    
    response = requests.get(endpoint, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        return f"Error: {response.status_code} - {response.text}"

def get_f1_drivers():
    """Get all F1 drivers"""
    endpoint = f"{BASE_URL}/drivers"
    params = {
        "api_token": API_KEY
    }
    
    response = requests.get(endpoint, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        return f"Error: {response.status_code} - {response.text}"

if __name__ == "__main__":
    # Test the API endpoints
    print("Getting F1 Seasons...")
    seasons = get_f1_seasons()
    print(seasons)
    
    print("\nGetting F1 Races...")
    races = get_f1_races()
    print(races)
    
    print("\nGetting F1 Drivers...")
    drivers = get_f1_drivers()
    print(drivers)