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

from Camera import Camera
from MyGeom import Point3D, Vector3D, Matrix4x4

from PyQt4 import QtGui, QtCore
from PyQt4.QtOpenGL import *
from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *
from Projector import Projector
from Projector import Projectors3

from Projectors4 import Projectors4

import math
import numpy
try:
    from PIL.Image import open as ImageOpen
except ImportError, err:
    from Image import open as ImageOpen


from Base import *

from Texture import Texture
from Shader import Shader

import CanvasModel

TEXTURE_PATH = "./images"


class GLWidget(QGLWidget):
    def __init__(self, parent):
        QGLWidget.__init__(self, parent)
        self.setMouseTracking(True)
        self.selectedProj = -1
        self.canvasModel = CanvasModel.Dome(23.0,11.5,11.5,0.0,1.0)
        self.showCanvas = True
        self.projectors = Projectors4(
            Projector(11.5),
            Projector(11.5),
            Projector(11.5),
            Projector(11.5),
              0.0,  # Tower Height
              25.0, # Pitch Angle
              0.0) # Yaw Angle

        self.edgeBlending = True
        self.showProjectorImages = True
        self.projImagesFullscreen = False
        # self.setMinimumSize(500, 500)
        
        self.camera = Camera()
        self.camera.setSceneRadius( 30 )
        self.camera.reset()
        self.isPressed = False
        self.oldx = self.oldy = 0
        
        self.textureFiles = os.listdir(TEXTURE_PATH)
        self.textures = dict()
        self.shaders = dict()
        self.selTexture = "spherical_small"

    def paintGL(self): 
      def paintProjectorImage(proj,offset,size,alpha):
        glColor(1.0,1.0,1.0,alpha)
        ar = 1.0 / proj.aspectRatio * 4.0
 
        className = str(self.canvasModel.__class__)
        projShader = self.shaders[className+"_proj"]
       # if self.selTexture in self.textures:
        glActiveTexture(GL_TEXTURE0); # use first texturing unit
        
        projShader.use()
        projShader.set(proj_texture = ("1i",[0]),
            alpha_value = ("1f",[alpha]))
        self.canvasModel.shaderSettings(projShader)
        self.projectors.shaderSettings(projShader)
        self.textures[self.selTexture].setup()
          
        glBegin( GL_QUADS )
        glTexCoord2f(0.0, 0.0); glVertex2fv(offset)
        glTexCoord2f(1.0, 0.0); glVertex2f(offset[0]+ar*size,offset[1]) 
        glTexCoord2f(1.0, 1.0); glVertex2f(offset[0]+ar*size,offset[1]+size)
        glTexCoord2f(0.0, 1.0); glVertex2f(offset[0],offset[1]+size)
        glEnd()
        
        projShader.unuse()

        if self.edgeBlending:
          edgeBlendShader = self.shaders[className+"_edgeblend"]
          edgeBlendShader.use()
      #    edgeBlendShader.set(proj_texture = ("1i",[0]),
      #        alpha_value = ("1f",[alpha]))
          self.canvasModel.shaderSettings(edgeBlendShader)
          self.projectors.shaderSettings(edgeBlendShader)
          self.projectors.edgeBlendShaderSettings(edgeBlendShader)
        
          glBegin( GL_QUADS )
          glTexCoord2f(0.0, 0.0); glVertex2fv(offset)
          glTexCoord2f(1.0, 0.0); glVertex2f(offset[0]+ar*size,offset[1]) 
          glTexCoord2f(1.0, 1.0); glVertex2f(offset[0]+ar*size,offset[1]+size)
          glTexCoord2f(0.0, 1.0); glVertex2f(offset[0],offset[1]+size)
          glEnd()

          edgeBlendShader.unuse()

      def drawProjectorImage():
        glLoadIdentity()
        glMatrixMode(GL_PROJECTION)
        glLoadIdentity()
        gluOrtho2D(0,1 / float(self.height()) * self.width(),0,1)
        glMatrixMode(GL_MODELVIEW)
        glLoadIdentity()

        glDisable( GL_DEPTH_TEST )
        glDisable( GL_CULL_FACE ) 
        if self.projImagesFullscreen and self.selectedProj != -1:
          paintProjectorImage(self.projectors[self.selectedProj],[0.0,0.0],1.0,0.5)
        else:
          bottom = 0.05
          size = 0.2
          xOffset = 0.05
          proj = self.projectors
          paintProjectorImage(proj,[xOffset,bottom],size,1.0)
          xOffset += size / proj.aspectRatio + 0.05
 
      glDisable(GL_TEXTURE_2D)
      light0 = Light(GL_LIGHT0,Point3D(0.0,-20.0,-20.0))
      light1 = Light(GL_LIGHT1,Point3D(0.0,20.0,20.0))

      glMatrixMode( GL_PROJECTION )
      glLoadIdentity()
      self.camera.transform()
      glMatrixMode( GL_MODELVIEW )
      glLoadIdentity();

      glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)

      glDepthFunc( GL_LEQUAL );
      glEnable( GL_DEPTH_TEST );
      
      colors = { "projA" : [1,0,0],
          "projB" : [0,1,0],
          "projC" : [0,0,1],
          "projC" : [1,1,0] }

      glPushMatrix()
      glLoadIdentity()
      #self.projectors.drawA(self.canvasModel,colors["projA"])
      #self.projectors.drawB(self.canvasModel,colors["projB"])
      #self.projectors.drawC(self.canvasModel,colors["projC"])
      #self.projectors.drawD(self.canvasModel,colors["projD"])
      glPopMatrix()
      
      if self.showCanvas: 
        mode = GLU_FILL
        texture = None

        if self.selTexture in self.textures:
          texture = self.textures[self.selTexture]
        shader = self.shaders[str(self.canvasModel.__class__)+"_inv_proj"]
        shader.use()
        self.canvasModel.shaderSettings(shader)
        self.projectors.shaderSettings(shader)
        shader.set(proj_multi = ("4f",[[1.0,1.0,1.0,1.0]]))
        self.canvasModel.draw(mode,texture,colors,None,self.selectedProj)
        shader.unuse()
      drawProjectorImage()
      
      glFlush()

    def resizeGL(self, widthInPixels, heightInPixels):
      self.camera.setViewportDimensions(widthInPixels, heightInPixels)
      glViewport(0, 0, widthInPixels, heightInPixels)

    def initializeGL(self):
      glClearColor(0.0, 0.0, 0.0, 1.0)
      glClearDepth(1.0)
 
      domeStr = "CanvasModel.Dome"
      self.shaders[domeStr+"_proj"] = Shader("shaders/dome_proj.vert","shaders/dome_4proj.frag") 
      self.shaders[domeStr+"_edgeblend"] = Shader("shaders/dome_edgeblend.vert","shaders/dome_edgeblend_4proj.frag") 
      self.shaders[domeStr+"_inv_proj"] = Shader("shaders/dome_inv_proj.vert","shaders/dome_inv_proj.frag") 
 #     cycloramaStr = "CanvasModel.Cyclorama"
 #     self.shaders[cycloramaStr+"_proj"] = Shader("shaders/cyclorama_proj.vert","shaders/dome_proj.frag") 
  #    self.shaders[cycloramaStr+"_edgeblend"] = Shader("shaders/cyclorama_edgeblend.vert","shaders/cyclorama_edgeblend.frag") 
   #   self.shaders[cycloramaStr+"_inv_proj"] = Shader("shaders/dome_inv_proj.vert","shaders/dome_inv_proj.frag") 
      
      for textureFile in self.textureFiles:
        texFile = os.path.join(TEXTURE_PATH,textureFile)
        self.textures[textureFile[:-4]] = Texture(texFile)
     
    def mouseMoveEvent(self, mouseEvent):
        if int(mouseEvent.buttons()) != QtCore.Qt.NoButton :
            # user is dragging
            delta_x = mouseEvent.x() - self.oldx
            delta_y = self.oldy - mouseEvent.y()
            if int(mouseEvent.buttons()) & QtCore.Qt.LeftButton :
                if int(mouseEvent.buttons()) & QtCore.Qt.MidButton :
                    self.camera.dollyCameraForward( 3*(delta_x+delta_y), False )
                else:
                    self.camera.orbit(self.oldx,self.oldy,mouseEvent.x(),mouseEvent.y())
            elif int(mouseEvent.buttons()) & QtCore.Qt.MidButton :
                self.camera.translateSceneRightAndUp( delta_x, delta_y )
            self.update()
        self.oldx = mouseEvent.x()
        self.oldy = mouseEvent.y()


    def getSelectedProj(self):
      proj = None
      if self.selectedProj == 0:
        proj = self.projectors.a
      elif self.selectedProj == 1:
        proj = self.projectors.b
      elif self.selectedProj == 2:
        proj = self.projectors.c
      return proj

    def setShowProjectorImages(self, value):
      self.showProjectorImages = value
      self.update()

    def setEdgeBlending(self, value):
      self.edgeBlending = value
      self.update()

    def setProjImagesFullscreen(self,value):
      self.projImagesFullscreen = value
      self.update()
    
    #def mouseDoubleClickEvent(self, mouseEvent):
    #    print "double click"

    def setSelTexture(self, value):
      self.selTexture = str(value)
      self.update()

    def wheelEvent(self,event):
      if int(event.modifiers()) == (QtCore.Qt.ControlModifier): 
        fov = self.camera.FIELD_OF_VIEW_IN_DEGREES
        fov += float(event.delta()) / 180
        if fov > 120: fov = 120
        if fov < 5: fov = 5
        self.camera.FIELD_OF_VIEW_IN_DEGREES = fov

      else: # Change distance of camera    
        self.camera.dollyCameraForward(event.delta() * 10.0 / self.camera.FIELD_OF_VIEW_IN_DEGREES,False)

      self.update()

    def mousePressEvent(self, e):
      self.isPressed = True

    def mouseReleaseEvent(self, e):
      self.isPressed = False

