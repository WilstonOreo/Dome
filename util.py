#! /usr/bin/env python
"""
    This file is part of DomeSimulator.

    DomeSimulator is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    DomeSimulator is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with DomeSimulator.  If not, see <http://www.gnu.org/licenses/>.

    DomeSimulator is free for non-commercial use. If you want to use it 
    commercially, you should contact the author 
    Michael Winkelmann aka Wilston Oreo by mail:
    me@wilstonoreo.net
"""

from __future__ import print_function

import math, numpy
from MyGeom import *

def xfrange(start, stop, step):
    while start < stop:
        yield start
        start += step

def getPosition(radius,height,yawAngle):
  theta = math.radians(yawAngle)
  return Point3D(math.cos(theta)*radius,math.sin(theta)*radius,height)

def pointOnSphere(pos,radius,yawAngle,pitchAngle):
  theta = math.radians(yawAngle)
  phi = math.radians(pitchAngle)
  cosTheta, sinTheta = math.cos(theta), math.sin(theta)
  cosPhi, sinPhi = math.cos(phi), math.sin(phi)
  return [pos.x()+radius*cosTheta*sinPhi,pos.y()+radius*sinTheta*sinPhi,pos.z()+radius*cosPhi]

""" v = interpolation coeff
"""
def interpolate(v,p0,p1):
  return p0 + v * (p1 - p0)
