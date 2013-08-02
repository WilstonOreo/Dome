#! /usr/bin/env python

from __future__ import print_function

import OpenGL 
OpenGL.ERROR_ON_COPY = True 
from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *
 
# PyOpenGL 3.0.1 introduces this convenience module...
from OpenGL.GL.shaders import *


class Shader:
  def __init__(self,vertFilename,fragFilename):
    def fileAsStr(filename):
      f = open(filename,'r')
      s = f.read()
      f.close()
      return s

    vertexShaderSource = fileAsStr(vertFilename)
    fragmentShaderSource = fileAsStr(fragFilename)

    self.program = compileProgram(
        compileShader(vertexShaderSource,GL_VERTEX_SHADER),
        compileShader(fragmentShaderSource,GL_FRAGMENT_SHADER))
  
  def set(self,**kwargs):
    for key in kwargs:
      self.setUniform(kwargs[key][0],key,kwargs[key][1])

  def setUniform(self,vecType,key,value):
    #loc = glGetUniformLocation(self.program,key)
    loc = self.__getUniform(key)
    if loc is not None: 
      #glUniform1i(loc,value)
      getattr(OpenGL.GL.shaders,'glUniform'+vecType+'v')(loc,len(value),value)
    
  def __getUniform(self,key):
    if not self.program: return
    loc = glGetUniformLocation(self.program,key)
    if not loc in (None,-1): 
      return loc

  """ Dictionary has the form:
      { varName : ("1f",[10]) }
      { varName : ("3f",[(1,2,3),(3,4,5)]) }
  """
  def use(self,**kwargs):
    for key in kwargs:
      self.__setUniform(key,kwargs[key][0],kwargs[key][1])
    glUseProgram(self.program)

  def unuse(self):
  	#Start using our program
	  glUseProgram(0) #self.program)

