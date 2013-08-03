from Camera import Camera
from MyGeom import Point3D, Vector3D, Matrix4x4

from PyQt4 import QtGui, QtCore
from PyQt4.QtOpenGL import *
from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *

import math
import numpy
try:
    from PIL.Image import open as ImageOpen
except ImportError, err:
    from Image import open as ImageOpen


from Base import *
import Dome

from Texture import Texture
from Shader import Shader

TEXTURE_PATH = "./images"


class GLWidget(QGLWidget):
    def __init__(self, parent):
        QGLWidget.__init__(self, parent)
        self.setMouseTracking(True)
        self.selectedProj = -1
        self.dome = Dome.Dome(7.5,3.5,Point3D())
        self.projectors = [
          Dome.Projector(0,50),
          Dome.Projector(120,50),
          Dome.Projector(240,50)]

        self.showProjectorImages = True
        self.showProjectors = True
        self.showDome = True
        self.projImagesFullscreen = False
        # self.setMinimumSize(500, 500)
        
        self.camera = Camera()
        self.camera.setSceneRadius( 30 )
        self.camera.reset()
        self.isPressed = False
        self.oldx = self.oldy = 0
        
        # Offsets for all three projectors
        self.pitchOffsets = [0.0,0.0,0.0]
        self.yawOffsets = [0.0,0.0,0.0]

        self.textureFiles = os.listdir(TEXTURE_PATH)
        self.textures = dict()
        self.shaders = dict()
        self.selTexture = "(none)"

    def paintGL(self): 
      def paintProjectorImage(proj,offset,size,alpha):

        glColor(1.0,1.0,1.0,alpha)
        ar = 1.0 / proj.aspectRatio 
 
        if self.selTexture in self.textures:
          shader = self.shaders["dome_proj"]
          shader.use()
          glActiveTexture(GL_TEXTURE0); # use first texturing unit
          shader.set(proj_texture = ("1i",[0]),
              dome_base_offset = ("1f",[self.dome.baseOffset]),
              dome_inner_radius = ("1f",[self.dome.innerRadius]),
              dome_radius = ("1f",[self.dome.radius]),
              proj_tower_height = ("1f",[proj.towerHeight]),
              proj_yaw = ("1f",[proj.yawAngle]),
              proj_pitch = ("1f",[proj.pitchAngle]),
              proj_offset = ("2f",[[proj.offset.x(),proj.offset.y()]]),
              proj_aspect_ratio = ("1f",[proj.aspectRatio]),
              proj_fov = ("1f",[proj.fov]),
              alpha_value = ("1f",[alpha]))

          self.textures[self.selTexture].setup()
          

        glBegin( GL_QUADS )
        glTexCoord2f(0.0, 0.0); glVertex2fv(offset)
        glTexCoord2f(1.0, 0.0); glVertex2f(offset[0]+ar*size,offset[1]) 
        glTexCoord2f(1.0, 1.0); glVertex2f(offset[0]+ar*size,offset[1]+size)
        glTexCoord2f(0.0, 1.0); glVertex2f(offset[0],offset[1]+size)
        glEnd()

        if self.selTexture in self.textures:
          shader.unuse()

      def drawProjectorImages():

        glLoadIdentity()
        glMatrixMode(GL_PROJECTION)
        glLoadIdentity()
        gluOrtho2D(0,1 / float(self.height()) * self.width(),0,1)
        glMatrixMode(GL_MODELVIEW);
        #glLoadIdentity();

        glDisable( GL_DEPTH_TEST )
        glDisable( GL_CULL_FACE ) 
        if self.projImagesFullscreen and self.selectedProj != -1:
          paintProjectorImage(self.projectors[self.selectedProj],[0.0,0.0],1.0,0.5)
        else:
          bottom = 0.05
          size = 0.2
          xOffset = 0.05
          for proj in self.projectors:
            paintProjectorImage(proj,[xOffset,bottom],size,1.0)
            xOffset += size / proj.aspectRatio + 0.05

      def drawProjectors():
        idx = 0
        colors = [[1,0,0],[0,1,0],[0,0,1]]
        for proj in self.projectors:
          if idx == self.selectedProj or self.selectedProj == -1:
            proj.draw(self.dome,colors[idx])
          idx += 1
 
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
      #glEnable( GL_CULL_FACE );
      #glFrontFace( GL_CCW );

      glRotatef(90,1,0,0)
      glTranslatef(0,0,self.dome.baseHeight + self.dome.towerHeight)

      mode = GLU_LINE
      if self.selTexture in self.textures:
        mode = GLU_FILL
        self.textures[self.selTexture].setup()
      
      if self.showProjectors:
        drawProjectors()
      
      if self.showDome: self.dome.draw(mode)


      if self.showProjectorImages:
        drawProjectorImages()
        
      glFlush()

    def resizeGL(self, widthInPixels, heightInPixels):
      self.camera.setViewportDimensions(widthInPixels, heightInPixels)
      glViewport(0, 0, widthInPixels, heightInPixels)

    def initializeGL(self):
      glClearColor(0.0, 0.0, 0.0, 1.0)
      glClearDepth(1.0)
 
      self.shaders["dome_proj"] = Shader("shaders/proj.vert","shaders/proj.frag") 
      #sys.exit(0)
      
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


    def setShowProjectorImages(self, value):
      self.showProjectorImages = value
      self.update()

    def setEdgeBlending(self, value):
      self.edgeBlending = value
      self.update()

    def setDomeDiameter(self, value):
      self.dome.radius = value / 2.0
      self.update()
    
    def setDomeInnerDiameter(self, value):
      self.dome.innerRadius = value / 2.0
      self.update()
    
    def setBaseHeight(self, value):
      self.dome.baseHeight = value
      self.update()

    def setTowerHeight(self, value):
      for proj in self.projectors:
        proj.towerHeight = value
      self.update()

    def setShowDome(self, value):
      self.showDome = value
      self.update()

    def setAngleOfView(self, value):
      for proj in self.projectors:
        proj.fov = value
      self.update()
    
    def setAspectRatio(self, value):
      for proj in self.projectors:
        proj.aspectRatio = value
      self.update()

    def setShowProjectors(self, value):
      self.showProjectors = value
      self.update()
    
    def setBaseOffset(self, value):
      self.dome.baseOffset = value
      self.update()

    def setProjImagesFullscreen(self,value):
      self.projImagesFullscreen = value
      self.update()

    def setShowScreenPoints(self, value):
      self.showScreenPoints = value
      self.update()

    def setShowProjectedPoints(self, value):
      self.showProjectedPoints = value
      self.update()
      
    def setPatchResolution(self, value):
      for proj in self.projectors:
        proj.patchResolution = value
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

