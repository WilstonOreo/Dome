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
 
class Projectors4(SceneObject):
  def __init__(self,
      a,b,c,d, # Projectors
      height,
      yawAngle,
      pitchAngle,
      fov = 68.2,aspectRatio = 0.75):
    SceneObject.__init__(self,Point3D(),GL_FLAT,False)
    self.a = a
    self.b = b
    self.c = c
    self.d = c
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
        tower_height = ("1f",[self.height]),
        pitch_angle = ("1f",[self.pitchAngle]))

    self.a.shaderSettings('a',shader)
    self.b.shaderSettings('b',shader)
    self.c.shaderSettings('c',shader)
    self.d.shaderSettings('d',shader)

  def edgeBlendShaderSettings(self,shader):
    self.a.edgeBlendShaderSettings("a",shader)
    self.b.edgeBlendShaderSettings("b",shader)
    self.c.edgeBlendShaderSettings("c",shader)
    self.d.edgeBlendShaderSettings("d",shader)
    shader.set(
        mask = ("1f",[0.0]),
        smart_edge = ("1f",[1.0])
        )

