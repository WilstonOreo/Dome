#!/usr/bin/env python
#
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

from SceneObject import SceneObject

from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *
import numpy, math
import util

from Base import *
from util import *
from MyGeom import *


class Projector:
  def __init__(self,distance_center,deltaHeight = 0.0,deltaPitch = 0.0,deltaYaw = 0.0,roll = 0.0,shift = 0.0):
    self.distance_center = distance_center
    self.deltaHeight = deltaHeight
    self.deltaPitch = deltaPitch
    self.deltaYaw = deltaYaw
    self.roll = roll
    self.shift = shift
    self.edgeBlendBlur = 0.05
    self.edgeBlendGamma = 1.0
    self.edgeBlendTopLeftRight = 0.05
    self.edgeBlendOffset = 0.00

  def genBorderPoints(self,pos,yaw,pitch,fov,aspectRatio,length):
    def rotMat(absYaw,absPitch):
      z = Matrix4x4.rotateAroundZ(math.radians(absYaw))
      y = Matrix4x4.rotateAroundY(math.radians(absPitch))
      x = Matrix4x4.rotateAroundX(math.radians(self.roll))
      return z * y * x
    def vec(matrix,vec):
      return pos + M * vec 

    absYaw = yaw + self.deltaYaw
    absPitch = pitch + self.deltaPitch
    a = fov / 2.0 
    l = math.tan(math.radians(a)) * length
    b = l * aspectRatio
    M = rotMat(absYaw,absPitch) 
    self.topLeft = vec(M,Vector3D(length,-l,b))
    self.topRight = vec(M,Vector3D(length,l,b))
    self.bottomLeft = vec(M,Vector3D(length,-l,-b))
    self.bottomRight = vec(M,Vector3D(length,l,-b))
    
  def pointOnScreen(self,length,x,y):
    return interpolate(y,
        interpolate(x,self.topLeft,self.topRight),
        interpolate(x,self.bottomLeft,self.bottomRight))
  
  def drawFrustum(self,pos,color):
    frustum = []
    topLeft = Segment(pos,self.topLeft)
    topRight = Segment(pos,self.topRight)
    bottomLeft = Segment(pos,self.bottomLeft)
    bottomRight = Segment(pos,self.bottomRight)
       
    frustum += [topLeft,topRight,bottomLeft,bottomRight]
    frustum.append(Segment(self.topLeft,self.bottomLeft)) # frame left
    frustum.append(Segment(self.topRight,self.bottomRight)) # frame right
    frustum.append(Segment(self.topLeft,self.topRight)) # frame top
    frustum.append(Segment(self.bottomLeft,self.bottomRight)) # frame bottom
    for segment in frustum:
      segment.draw(color)
 
class Projectors3(SceneObject):
  def __init__(self,
      a,b,c, # Projectors
      distance_a_b,
      distance_a_c,
      height,
      yawAngle,
      pitchAngle,
      fov = 68.2,aspectRatio = 0.75):
    SceneObject.__init__(self,Point3D(),GL_FLAT,False)
    self.a = a
    self.b = b
    self.c = c
    self.distance_a_b = distance_a_b
    self.distance_a_c = distance_a_c
    self.yawAngle = yawAngle
    self.pitchAngle = pitchAngle
    self.aspectRatio = aspectRatio
    self.fov = fov
    self.height = height
    self.draw = True

  def getPositionA(self):
    return Point3D(-self.a.distance_center,self.a.shift,-self.height - self.a.deltaHeight);
   
  def drawA(self,dome,color):
    pos = self.getPositionA()
    pos = Matrix4x4.rotateAroundZ(math.radians(self.yawAngle)) * pos
    self.a.genBorderPoints(pos,self.yawAngle,self.pitchAngle,self.fov,self.aspectRatio,dome.getRadius())
    self.a.drawFrustum(pos,color)

  def drawB(self,dome,color):
    b = self.b
    posA = self.getPositionA()
    intersect = util.intersectionPointsOfCirclesFromPoints(posA,self.distance_a_b,Point3D(),b.distance_center)
    if intersect is None: return
    p = Vector3D(intersect[0][0],intersect[0][1],0.0)
    yaw = getYawAngle(Vector3D(-p.x(),-p.y(),0.0))
    shiftVec = Vector3D(p.x(),-p.y(),0.0).normalized() * b.shift
    pos = p + shiftVec - Point3D(0,0,self.height + b.deltaHeight)
    pos = Matrix4x4.rotateAroundZ(math.radians(self.yawAngle)) * pos

    self.b.genBorderPoints(pos,yaw + self.yawAngle,self.pitchAngle,self.fov,self.aspectRatio,dome.getRadius())
    self.b.drawFrustum(pos,color)

  def drawC(self,dome,color):
    c = self.c
    posA = self.getPositionA()
    intersect = util.intersectionPointsOfCirclesFromPoints(posA,self.distance_a_c,Point3D(),c.distance_center)
    if intersect is None: return

    p = Vector3D(intersect[1][0],intersect[1][1],0.0)
    yaw = getYawAngle(Vector3D(-p.x(),-p.y(),0.0))
    shiftVec = Vector3D(p.x(),-p.y(),0.0).normalized() * c.shift
    pos = p + shiftVec - Point3D(0,0,self.height + c.deltaHeight)
    pos = Matrix4x4.rotateAroundZ(math.radians(self.yawAngle)) * pos
    self.c.genBorderPoints(pos,yaw + self.yawAngle,self.pitchAngle,self.fov,self.aspectRatio,dome.getRadius())
    self.c.drawFrustum(pos,color)

  def draw(self,dome,colors):
    if not self.draw: return
    glPushMatrix()
    glTranslatef(0,0,-dome.radius)
    length = dome.radius
    theta = math.radians(self.yawAngle)
    posRadius = dome.innerRadius + self.offset.y()
    self.position = getPosition(self.offset.x(),0,self.yawAngle - 90.0) + getPosition(posRadius,(dome.radius - self.towerHeight),self.yawAngle)

    #self.__drawA(colors[0])


    glPopMatrix()

  def shaderSettings(self,shader):
    shader.set(
        proj_fov = ("1f",[self.fov]),
        proj_aspect_ratio = ("1f",[self.aspectRatio]),
        proj_yaw = ("1f",[self.yawAngle]),
        a_alpha = ("1f",[1.0]),
        b_alpha = ("1f",[1.0]),
        c_alpha = ("1f",[1.0]),
        a_gamma = ("1f",[1.0]),
        b_gamma = ("1f",[1.0]),
        c_gamma = ("1f",[1.0]),
        b_yaw = ("1f",[self.distance_a_b]),
        c_yaw = ("1f",[self.distance_a_c]),
        a_distance_center = ("1f",[self.a.distance_center]),
        b_distance_center = ("1f",[self.b.distance_center]),
        c_distance_center = ("1f",[self.c.distance_center]),
        tower_height = ("1f",[self.height]),
        pitch_angle = ("1f",[self.pitchAngle]),
        a_delta_yaw = ("1f",[self.a.deltaYaw]),
        b_delta_yaw = ("1f",[self.b.deltaYaw]),
        c_delta_yaw = ("1f",[self.c.deltaYaw]),
        a_delta_height = ("1f",[self.a.deltaHeight]),
        b_delta_height = ("1f",[self.b.deltaHeight]),
        c_delta_height = ("1f",[self.c.deltaHeight]),
        a_delta_pitch = ("1f",[self.a.deltaPitch]),
        b_delta_pitch = ("1f",[self.b.deltaPitch]),
        c_delta_pitch = ("1f",[self.c.deltaPitch]),
        a_roll = ("1f",[self.a.roll]),
        b_roll = ("1f",[self.b.roll]),
        c_roll = ("1f",[self.c.roll]),
        a_shift = ("1f",[self.a.shift]),
        b_shift  = ("1f",[self.b.shift]),
        c_shift = ("1f",[self.c.shift]))

  def edgeBlendShaderSettings(self,shader):
    shader.set(
        a_top = ("1f",[self.a.edgeBlendTopLeftRight]),
        a_edge_gamma = ("1f",[self.a.edgeBlendGamma]),
        a_left_side = ("1f",[self.a.edgeBlendTopLeftRight]),
        a_right_side = ("1f",[self.a.edgeBlendTopLeftRight]),
        b_top = ("1f",[self.b.edgeBlendTopLeftRight]),
        b_edge_gamma = ("1f",[self.b.edgeBlendGamma]),
        b_left_side = ("1f",[self.b.edgeBlendTopLeftRight]),
        b_right_side = ("1f",[self.b.edgeBlendTopLeftRight]),
        c_top = ("1f",[self.c.edgeBlendTopLeftRight]),
        c_edge_gamma = ("1f",[self.c.edgeBlendGamma]),
        c_left_side = ("1f",[self.c.edgeBlendTopLeftRight]),
        c_right_side = ("1f",[self.c.edgeBlendTopLeftRight]),
        b_a_edge_blur = ("1f",[self.a.edgeBlendBlur]),
        b_a_edge_offset = ("1f",[self.a.edgeBlendOffset]),
        c_a_edge_blur = ("1f",[self.a.edgeBlendBlur]),
        c_a_edge_offset = ("1f",[self.a.edgeBlendOffset]),
        c_b_edge_blur = ("1f",[self.b.edgeBlendBlur]),
        c_b_edge_offset = ("1f",[self.b.edgeBlendOffset]),
        b_a_squeeze_left = ("1f",[0.0]),
        b_a_squeeze_right = ("1f",[0.0]),
        b_a_squeeze_top = ("1f",[0.0]),
        b_a_squeeze_bottom = ("1f",[0.0]),
        c_a_squeeze_left = ("1f",[0.0]),
        c_a_squeeze_right = ("1f",[0.0]),
        c_a_squeeze_top = ("1f",[0.0]),
        c_a_squeeze_bottom = ("1f",[0.0]),
        c_b_squeeze_left = ("1f",[0.0]),
        c_b_squeeze_right = ("1f",[0.0]),
        c_b_squeeze_top = ("1f",[0.0]),
        c_b_squeeze_bottom = ("1f",[0.0]),
        mask = ("1f",[0.0]),
        smart_edge = ("1f",[1.0])
        )
   
  def __domeIntersection(self,pos,radius,org,d,near):
    # Compute A, B and C coefficients
    o = org - pos
    a = d.x()*d.x() + d.y()*d.y() + d.z()*d.z()
    b = 2.0 * (d.x() * o.x() + d.y() * o.y() + d.z() * o.z()) 
    c = (o.x() * o.x() + o.y() * o.y() +  o.z() * o.z())  - radius*radius

    # Find discriminant
    disc = b*b - 4.0 * a * c
    # if discriminant is negative there are no real roots, so return 
    if disc < 0: return None

    distSqrt = math.sqrt(disc)
    q = (-b - distSqrt)*0.5 if b < 0 else (-b + distSqrt)*0.5
    if q == 0: return None
    t = c / q
    if t < 0.0: t = q / a;
    if t < near: return None
    return org + Vector3D(t*d.x(),t*d.y(),t*d.z())


