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



class Dome(SceneObject):
  def __init__(self,diameter,center_pole,center_equator,strip_top,strip_bottom):
    SceneObject.__init__(self,Point3D(),GL_SMOOTH,True)
    self.diameter = diameter
    self.center_pole = center_pole
    self.center_equator = center_equator
    self.strip_top = strip_top
    self.strip_bottom = strip_bottom
    self.sphere = gluNewQuadric()
    gluQuadricTexture(self.sphere, GL_TRUE)
    gluQuadricNormals(self.sphere, GLU_SMOOTH)

  def getRadius(self):
    return self.diameter / 2.0

  def shaderSettings(self,shader):
    shader.set(proj_texture = ("1i",[0]),
        dome_diameter = ("1f",[self.diameter]),
        proj_mode = ("1f",[-1.0]),
        distance_center_pole = ("1f",[self.center_pole]),
        distance_center_equator = ("1f",[self.center_equator]),
        strip_top = ("1f",[self.strip_top]),
        strip_bottom = ("1f",[self.strip_bottom]))

  def draw(self,mode,texture,colors,shader,selectedProj):
    def v(enabled):
      return 1.0 if enabled else 0.0
    self.beginDraw()

    glEnable(GL_LIGHTING)
 
    glPushMatrix()
    glColor(0.0,1.0,1.0,0.5)
    glutSolidCylinder(self.getRadius(),1,64,4)
    glPopMatrix()

    if texture is not None:
      texture.setup()

    z = math.sqrt(abs(self.center_equator**2 - self.getRadius()**2))

    glPushMatrix()
    glColor(1.0,1.0,1.0,0.5)
    glTranslatef(0,0,-z)
    glScalef(1,1,(self.center_pole - z)*2.0 / (self.diameter))
    gluQuadricDrawStyle(self.sphere, mode)
    gluSphere(self.sphere, self.getRadius(), 64, 64)
    glPopMatrix()
   
    glDisable(GL_TEXTURE_2D)

    self.endDraw()

class Cyclorama(SceneObject):
  def __init__(self,diameter,height,offset):
    SceneObject.__init__(self,Point3D(),GL_SMOOTH,True)
    self.diameter = diameter
    self.height = height
    self.offset = offset
    self.cylinder = gluNewQuadric()
    gluQuadricTexture(self.cylinder, GL_TRUE)
    gluQuadricNormals(self.cylinder, GLU_SMOOTH)

  def getRadius(self):
    return self.diameter / 2.0
  
  def shaderSettings(self,shader):
    shader.set(proj_texture = ("1i",[0]),
        cyclorama_diameter = ("1f",[self.diameter]),
        cyclorama_height = ("1f",[self.height]),
        cyclorama_z_offset = ("1f",[self.offset]))

  def draw(self,mode,texture,colors,shader,selectedProj):
    self.beginDraw()
    glPushMatrix()
    glTranslatef(0,0,-self.offset)
    if texture is not None:
      texture.setup()
    r = self.getRadius()
    gluCylinder(self.cylinder,r,r,self.height,64,4)
    glPopMatrix()

    self.endDraw()


