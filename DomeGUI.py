#! /usr/bin/env python

from __future__ import print_function

from PyQt4 import QtGui, QtCore, uic
from OpenGL.GLUT import *
from optparse import OptionParser

import os, sys
import qdarkstyle
from MyGeom import *

class DomeGUI(QtGui.QMainWindow):
  def __init__(self):
    QtGui.QMainWindow.__init__(self)
    uic.loadUi('DomeGUI.ui', self)
    self.statusBar().showMessage("2013 by Wilston Oreo (me@wilstonoreo.net).")
    self.showMaximized()

    cssFile="qdarkstyle/style.qss"
    with open(cssFile,"r") as fh:
      self.setStyleSheet(qdarkstyle.load_stylesheet(pyside=False))
    
    self.boxImages.addItem(QtCore.QString("(none)"))
    for textureFile in self.glWidget.textureFiles:
      self.boxImages.addItem(QtCore.QString(textureFile[:-4]))
      #self.setStyleSheet(fh.read())

  def selectProj1(self):
    self.__getProjectorSettings(0)

  def selectProj2(self):
    self.__getProjectorSettings(1)
    
  def selectProj3(self):
    self.__getProjectorSettings(2)

  def selectProjAll(self):
    self.__getProjectorSettings(-1)

  def __getProjectorSettings(self,projId):
    def disconnect(objects):
      for obj in objects:
        QtCore.QObject.disconnect(obj,QtCore.SIGNAL("valueChanged(double)"),self.setProjectorSettings)
    def connect(objects):
      for obj in objects:
        QtCore.QObject.connect(obj,QtCore.SIGNAL("valueChanged(double)"),self.setProjectorSettings)

    self.setProjectorSettings()
    self.glWidget.selectedProj = projId
    allSelected = projId == -1 

    self.boxYawOffset.setDisabled(allSelected)
    self.boxPitchOffset.setDisabled(allSelected)
    self.boxOffsetX.setDisabled(allSelected)
    self.boxOffsetY.setDisabled(allSelected)

    if not allSelected:
      proj = self.glWidget.projectors[projId]
      objects = [self.boxYawOffset,
          self.boxPitchOffset,
          self.boxOffsetX,
          self.boxOffsetY]

      disconnect(objects)
      self.boxYawOffset.setValue(self.glWidget.yawOffsets[projId])
      self.boxPitchOffset.setValue(self.glWidget.pitchOffsets[projId])
      self.boxOffsetX.setValue(proj.offset.x())
      self.boxOffsetY.setValue(proj.offset.y())
      connect(objects)

    self.glWidget.update()

  def setProjectorSettings(self,value = 0.0):    
    allSelected = self.glWidget.selectedProj == -1 
    if not allSelected:
      projId = self.glWidget.selectedProj
      proj = self.glWidget.projectors[projId]
      self.glWidget.yawOffsets[projId] = self.boxYawOffset.value()
      self.glWidget.pitchOffsets[projId] = self.boxPitchOffset.value()
      proj.offset = Vector3D(
          self.boxOffsetX.value(),
          self.boxOffsetY.value(),0.0)
      proj.yawAngle = self.boxYawAngle.value() + projId*120 + self.glWidget.yawOffsets[projId] 
      proj.pitchAngle = self.boxPitchAngle.value() + self.glWidget.pitchOffsets[projId]

    for projId in range(0,3):
      proj = self.glWidget.projectors[projId]
      proj.yawAngle = self.boxYawAngle.value() + projId*120 + self.glWidget.yawOffsets[projId] 
      proj.pitchAngle = self.boxPitchAngle.value() + self.glWidget.pitchOffsets[projId]
      proj.drawFrustum = self.chkFrustum.isChecked()
      proj.drawRays = self.chkRays.isChecked()
      proj.drawGrid = self.chkGrid.isChecked()
      proj.drawProjPoints = self.chkProjPoints.isChecked()

    self.glWidget.update()

if __name__ == '__main__': 
  app = QtGui.QApplication(['Dome'])
  glutInit(sys.argv)
  window = DomeGUI()
  window.show()

  sys.exit(app.exec_())

