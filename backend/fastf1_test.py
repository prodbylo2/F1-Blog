import fastf1
import fastf1.plotting
import matplotlib.pyplot as plt
from datetime import datetime
import pandas as pd

# Enable cache to speed up subsequent data loading
fastf1.Cache.enable_cache('cache')

def format_laptime(td):
    """Convert timedelta to formatted string (MM:SS.mmm)"""
    if pd.isna(td):
        return "No time"
    total_seconds = td.total_seconds()
    minutes = int(total_seconds // 60)
    seconds = total_seconds % 60
    return f"{minutes:02d}:{seconds:06.3f}"

def get_race_results(year, gp):
    """Get race results for a specific Grand Prix"""
    race = fastf1.get_session(year, gp, 'R')
    race.load()
    results = race.results
    return results[['Position', 'DriverNumber', 'Points', 'Status', 'FullName']]

def get_qualifying_results(year, gp):
    """Get qualifying results for a specific Grand Prix"""
    quali = fastf1.get_session(year, gp, 'Q')
    quali.load()
    return quali.results[['Position', 'DriverNumber', 'FullName', 'Q1', 'Q2', 'Q3']]

def get_driver_telemetry(year, gp, driver_number):
    """Get telemetry data for a specific driver in a race"""
    race = fastf1.get_session(year, gp, 'R')
    race.load()
    driver = race.laps.pick_drivers(driver_number)
    return driver[['LapNumber', 'LapTime', 'Sector1Time', 'Sector2Time', 'Sector3Time']]

def get_driver_comparison(year, gp, driver1_num, driver2_num):
    """Compare fastest laps between two drivers"""
    quali = fastf1.get_session(year, gp, 'Q')
    quali.load()
    
    # Get driver info from results
    driver1_info = quali.results[quali.results['DriverNumber'] == str(driver1_num)].iloc[0]
    driver2_info = quali.results[quali.results['DriverNumber'] == str(driver2_num)].iloc[0]
    
    # Get fastest laps
    driver1_lap = quali.laps.pick_drivers(driver1_num).pick_fastest()
    driver2_lap = quali.laps.pick_drivers(driver2_num).pick_fastest()
    
    return {
        driver1_info['FullName']: format_laptime(driver1_lap['LapTime']),
        driver2_info['FullName']: format_laptime(driver2_lap['LapTime'])
    }

def get_current_schedule():
    """Get the current F1 schedule"""
    schedule = fastf1.get_event_schedule(datetime.now().year)
    return schedule[['EventName', 'EventDate', 'EventFormat', 'RoundNumber']]

if __name__ == "__main__":
    pd.set_option('display.max_rows', None)
    
    # Test various functions
    print("Current F1 Schedule:")
    print(get_current_schedule())
    print("\n")

    # Get race results from the 2023 Abu Dhabi GP
    print("2023 Abu Dhabi GP Race Results:")
    print(get_race_results(2023, 'Abu Dhabi'))
    print("\n")

    # Get qualifying results from the 2023 Abu Dhabi GP
    print("2023 Abu Dhabi GP Qualifying Results:")
    print(get_qualifying_results(2024, 'Qatar'))
    print("\n")

    # Compare Verstappen (1) and Hamilton (44) fastest laps
    print("Fastest Lap Comparison (Verstappen vs Hamilton):")
    print(get_driver_comparison(2023, 'Abu Dhabi', 1, 44))
