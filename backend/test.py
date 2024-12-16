from urllib.request import urlopen
import json

response = urlopen('https://api.openf1.org/v1/sessions?year=2022&country_name=Bahrain')

# response = urlopen('https://api.openf1.org/v1/stints?meeting_key=1224&driver_number=1')
# response = urlopen('https://api.openf1.org/v1/sessions')

data = json.loads(response.read().decode('utf-8'))
print(data)