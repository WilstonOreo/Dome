#!/usr/bin/env python
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

from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *

from MyGeom import *


class SceneObject:
  def __init__(self,position,shadeModel,hasLightning):
    self.shadeModel = shadeModel
    self.position = position
    self.hasLightning = hasLightning

  def beginDraw(self):
    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

    glShadeModel(self.shadeModel)
    if self.hasLightning: 
      glEnable(GL_LIGHTING)
    else:
      glDisable(GL_LIGHTING)
    glPushMatrix()
    glTranslate(self.position.x(),self.position.y(),self.position.z())

  def endDraw(self):
    glPopMatrix()

