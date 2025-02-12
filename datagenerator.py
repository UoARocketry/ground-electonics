from math import cos, sin, sqrt, acos, atan2, pi
import requests
from time import sleep

position = [50 + 6371000, -36.68732*pi/180, 174.65674*pi/180]

url = 'http://raspberrypi.local/api/update'

def convert_to_cartesian(pos):
    r = pos[0]
    x = r*cos(pos[1])*sin(pos[2])
    y = r*sin(pos[1])*sin(pos[2])
    z = r*cos(pos[2])
    return [x, y, z]

def convert_to_spherical(pos):
    r = sqrt(pos[0]**2 + pos[1]**2 + pos[2]**2)
    theta = atan2(pos[1] , pos[0])
    phi = acos(pos[2]/ r)
    return [r, theta, phi]

root = convert_to_cartesian(position)
position = convert_to_cartesian(position)

print(root)

for i in range(11):
    position[0] = root[0] + i*10
    position[1] = root[1] + -0.01*i*10*(i*10 - 100)
    data = convert_to_spherical(position)
    requests.post(url, json = {"alt": data[0] - 6371000, "lat": data[1], "lon": data[2]})
    sleep(1)