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

from Base import *
from util import *
from MyGeom import *


class Projector(SceneObject):
  def __init__(self,yawAngle,pitchAngle,fov = 68.2,aspectRatio = 0.75,offset = Point3D(),towerHeight = 2.3,patchResolution = 8):
    SceneObject.__init__(self,Point3D(),GL_FLAT,False)
    self.yawAngle = yawAngle
    self.pitchAngle = pitchAngle
    self.patchResolution = patchResolution
    self.aspectRatio = aspectRatio
    self.fov = fov
    self.towerHeight = towerHeight
    self.offset = offset
    self.drawGrid = True
    self.drawRays = True
    self.drawFrustum = True
    self.drawProjPoints = True

  def draw(self,dome,color):
    glPushMatrix()
    glTranslatef(0,0,-dome.radius)
    length = dome.radius
    theta = math.radians(self.yawAngle)
    posRadius = dome.innerRadius + self.offset.y()
    self.position = getPosition(self.offset.x(),0,self.yawAngle - 90.0) + getPosition(posRadius,(dome.radius - self.towerHeight),self.yawAngle)
    self.__genBorderPoints(self.position,length)

    if self.drawGrid: self.__drawGrid(length,color)
    if self.drawFrustum: self.__drawFrustum(length,color)
    if self.drawRays: self.__drawRays(length,color)
    if self.drawProjPoints: self.__drawProjPoints(dome,color)
   
    glPopMatrix()

  def __genBorderPoints(self,pos,length):
    def rotMat():
      return Matrix4x4.rotateAroundZ(math.radians(self.yawAngle)) * Matrix4x4.rotateAroundY(math.radians(180.0 - self.pitchAngle))
    def vec(matrix,vec):
      return pos + M * vec

    a = self.fov / 2 
    l = math.tan(math.radians(a)) * length
    b = l * self.aspectRatio

    M = rotMat() 
    self.topLeft = vec(M,Vector3D(length,-l,b))
    self.topRight = vec(M,Vector3D(length,l,b))
    self.bottomLeft = vec(M,Vector3D(length,-l,-b))
    self.bottomRight = vec(M,Vector3D(length,l,-b))
    
  def __pointOnScreen(self,length,x,y):
    return interpolate(y,
        interpolate(x,self.topLeft,self.topRight),
        interpolate(x,self.bottomLeft,self.bottomRight))

  def __generateFrustumRay(self,length,x,y):
    return Segment(self.position,self.__pointOnScreen(length,x,y))

  def __drawFrustum(self,length,color):
    frustum = []
    topLeft = Segment(self.position,self.topLeft)
    topRight = Segment(self.position,self.topRight)
    bottomLeft = Segment(self.position,self.bottomLeft)
    bottomRight = Segment(self.position,self.bottomRight)
       
    frustum += [topLeft,topRight,bottomLeft,bottomRight]
    frustum.append(Segment(self.topLeft,self.bottomLeft)) # frame left
    frustum.append(Segment(self.topRight,self.bottomRight)) # frame right
    frustum.append(Segment(self.topLeft,self.topRight)) # frame top
    frustum.append(Segment(self.bottomLeft,self.bottomRight)) # frame bottom
    for segment in frustum:
      segment.draw(color)
    
  def __drawGrid(self,length,color):
    inc = 1 / float(self.patchResolution)
    gridColor = [color[0],color[1],color[2],0.5]
    for x in xfrange(inc,1,inc):
      Segment(self.__pointOnScreen(length,x,0),self.__pointOnScreen(length,x,1)).draw(gridColor)
    for y in xfrange(inc,1,inc):
      Segment(self.__pointOnScreen(length,0,y),self.__pointOnScreen(length,1,y)).draw(gridColor)

  def __drawRays(self,length,color):
    inc = 1 / float(self.patchResolution)
    for x in xfrange(0,1+inc,inc):
      for y in xfrange(0,1+inc,inc):
        self.__generateFrustumRay(length,x,y).draw([color[0],color[1],color[2],0.25])
  
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
    if t < near: return None
    return org + Vector3D(t*d.x(),t*d.y(),t*d.z())

  def __drawProjPoints(self,dome,color):
    glColor3f(color[0],color[1],color[2])
    inc = 1 / float(self.patchResolution)
    o = self.position
    p = Point3D(dome.position.x(),dome.position.y(),dome.position.z() - dome.baseOffset) 
    glPointSize(3.0)
    glBegin(GL_POINTS)
    glVertex3fv(o.get())
    glVertex3fv(p.get())
    for x in xfrange(0,1+inc,inc):
      for y in xfrange(0,1+inc,inc):
        d = self.__pointOnScreen(dome.radius,x,y) - o
        iPoint = self.__domeIntersection(
            p,
            dome.radius*1.001,o,d,
            dome.radius / 100000.0)
        if iPoint is not None: 
          glVertex3f(iPoint.x(),iPoint.y(),iPoint.z())
    glEnd()


class Dome(SceneObject):
  def __init__(self,radius,baseHeight,position,baseOffset = 0.0,towerHeight = 2.3,innerRadius = 6.0):
    SceneObject.__init__(self,position,GL_SMOOTH,True)
    self.radius = radius
    self.baseHeight = baseHeight
    self.baseOffset = baseOffset
    self.towerHeight = towerHeight
    self.innerRadius = innerRadius
    self.position = position
    self.sphere = gluNewQuadric()
    gluQuadricTexture(self.sphere, GL_TRUE);
    gluQuadricNormals(self.sphere, GLU_SMOOTH);

  def draw(self,mode = GLU_LINE):
    self.beginDraw()

    glEnable(GL_LIGHTING)

    glPushMatrix()
    glColor(0.0,1.0,1.0,0.5)
    glTranslatef(0,0,- self.baseHeight)
    glutSolidCylinder(self.radius,self.baseHeight,64,4)
    glPopMatrix()

    glPushMatrix()
    glColor(1.0,1.0,1.0,0.5)
    glTranslatef(0,0,- self.radius - self.baseOffset)
    gluQuadricDrawStyle(self.sphere, mode)
    gluSphere(self.sphere, self.radius, 64, 64)
    glPopMatrix()

    glDisable(GL_TEXTURE_2D)

    self.endDraw()

