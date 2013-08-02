#! /usr/bin/env python

from __future__ import print_function

from PyQt4.QtOpenGL import *
import numpy
from OpenGL.GL import *
from OpenGL.GLU import *


try:
    from PIL.Image import open as ImageOpen
except ImportError, err:
    from Image import open as ImageOpen

class Texture:
  def __init__(self,imageFilename):
    self.imageID = self.loadImage(imageFilename)

  def setup(self): 
    #glTexEnvf( GL_TEXTURE_ENV, GL_TEXTURE_ENV_MODE, GL_MODULATE );
    glEnable(GL_TEXTURE_2D)
    glTexEnvf(GL_TEXTURE_ENV, GL_TEXTURE_ENV_MODE, GL_MODULATE)   
    glTexParameterf( GL_TEXTURE_2D, GL_TEXTURE_WRAP_S,
                     GL_REPEAT);
    glTexParameterf( GL_TEXTURE_2D, GL_TEXTURE_WRAP_T,
                     GL_REPEAT );
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR)
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR)
    glBindTexture(GL_TEXTURE_2D, self.imageID)

  def loadImage( self, imageName):
    glEnable(GL_TEXTURE_2D)
    """Load an image file as a 2D texture using PIL"""
    im = ImageOpen(imageName)    
    img_data = numpy.array(im.getdata(), numpy.uint8)

    self.imageID = glGenTextures(1)
    glPixelStorei(GL_UNPACK_ALIGNMENT,1)
    glBindTexture(GL_TEXTURE_2D, self.imageID)
    glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP)
    glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP)
    glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR)
    glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR)
    glTexImage2D(
        GL_TEXTURE_2D, 0, GL_RGB, im.size[0], im.size[1], 0,
        GL_RGB, GL_UNSIGNED_BYTE, img_data
    )
    
    return self.imageID
