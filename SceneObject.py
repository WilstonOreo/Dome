#!/usr/bin/env python
#
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

