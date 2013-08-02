#! /usr/bin/env python

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
