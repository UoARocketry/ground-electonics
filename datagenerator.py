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

data = []

for i in range(10):
    data.append(convert_to_spherical(position))
    requests.post(url, json = {"alt": data[-1][0] - 6371000, "lat": data[-1][1], "lon": data[-1][2]})
    position[0] += 10
    position[1] += 10
    sleep(1)
    

print(root)
print([convert_to_cartesian(i) for i in data])
for i in data:
    i = convert_to_cartesian(i)
    print("x: ", i[0] - root[0], "y: ", i[1] - root[1], "z: ", i[2] - root[2])
    # print("x: ", i[0], "y: ", i[1], "z: ", i[2])