from urllib.request import urlopen
import json

# response = urlopen('https://api.openf1.org/v1/sessions?year=2024&country_name=Brazil')

response = urlopen('https://api.openf1.org/v1/stints?meeting_key=1249&driver_number=30')
# response = urlopen('https://api.openf1.org/v1/sessions')

data = json.loads(response.read().decode('utf-8'))
print(data)