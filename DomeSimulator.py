#! /usr/bin/env python
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

from PyQt4 import QtGui, QtCore, uic
from OpenGL.GLUT import *
from optparse import OptionParser
import Shader
import CanvasModel

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
    proj = self.glWidget.getSelectedProj()
    allSelected = proj is None
    objects = [
        self.boxYawOffset,
        self.boxPitchOffset,
        self.boxRollOffset,
        self.boxHeightOffset,
        self.boxShift,
        self.boxEdgeBlur,
        self.boxEdgeOffset,
        self.boxGamma,
        self.boxTopLeftRight]
    for obj in objects:
      obj.setDisabled(allSelected)

    if not allSelected:
      disconnect(objects)
      self.boxYawOffset.setValue(proj.deltaYaw)
      self.boxPitchOffset.setValue(proj.deltaPitch)
      self.boxRollOffset.setValue(proj.roll)
      self.boxHeightOffset.setValue(proj.deltaHeight)
      self.boxShift.setValue(proj.shift)
      self.boxEdgeBlur.setValue(proj.edgeBlendBlur)
      self.boxGamma.setValue(proj.edgeBlendGamma)
      self.boxTopLeftRight.setValue(proj.edgeBlendTopLeftRight)
      self.boxEdgeOffset.setValue(proj.edgeBlendOffset)
      connect(objects)
    self.glWidget.update()

  def setProjectorSettings(self,value = 0.0):    
    proj = self.glWidget.getSelectedProj()

    if proj is not None: 
      proj.deltaYaw = self.boxYawOffset.value()
      proj.deltaPitch = self.boxPitchOffset.value()
      proj.deltaHeight = self.boxHeightOffset.value()
      proj.roll = self.boxRollOffset.value()
      proj.shift = self.boxShift.value()
      proj.edgeBlendBlur = self.boxEdgeBlur.value()
      proj.edgeBlendGamma = self.boxGamma.value()
      proj.edgeBlendTopLeftRight = self.boxTopLeftRight.value()
      proj.edgeBlendOffset = self.boxEdgeOffset.value()
    
    projectors = self.glWidget.projectors
    projA, projB, projC = projectors.a, projectors.b, projectors.c

    projA.distance_center = self.boxACenter.value()
    projB.distance_center = self.boxBCenter.value()
    projC.distance_center = self.boxCCenter.value()

    projA.draw = self.chkFrustum.isChecked()
    projB.draw = self.chkFrustum.isChecked()
    projC.draw = self.chkFrustum.isChecked()
    
    projA.drawProjections = self.chkHighlightProjections.isChecked()
    projB.drawProjections = self.chkHighlightProjections.isChecked()
    projC.drawProjections = self.chkHighlightProjections.isChecked()

    projectors.fov = self.boxAngleOfView.value()
    projectors.aspectRatio = self.boxAspectRatio.value()
    projectors.distance_a_b = self.boxAB.value()
    projectors.distance_a_c = self.boxAC.value()
    projectors.yawAngle = self.boxYawAngle.value()
    projectors.pitchAngle = self.boxPitchAngle.value()
    projectors.height = self.boxTowerHeight.value()
    self.glWidget.update()

  def setDomeSettings(self,value = 0.0):
    self.glWidget.canvasModel = CanvasModel.Dome(
        self.boxDomeDiameter.value(),
        self.boxCenterPole.value(),
        self.boxCenterEquator.value(),
        self.boxRangeTop.value(),
        self.boxRangeBottom.value())
    self.glWidget.showCanvas = self.chkShowDome.isChecked()
    self.glWidget.update()


  def setCycloramaSettings(self,value = 0.0):
    self.glWidget.canvasModel = CanvasModel.Cyclorama(
        self.boxCycloramaDiameter.value(),
        self.boxCycloramaHeight.value(),
        self.boxCycloramaOffset.value())
    self.glWidget.showCanvas = self.chkShowDome.isChecked()
    self.glWidget.update()

  def setCanvasModel(self):
    if self.btnDome.isChecked():
      self.grpCyclorama.hide()
      self.setDomeSettings()
      self.grpDome.show()

    elif self.btnCyclorama.isChecked():
      self.grpCyclorama.show()
      self.grpDome.hide()
      self.setCycloramaSettings()


if __name__ == '__main__': 

  parser = OptionParser()
  parser.add_option("-s","--shader", action="store", type="string", dest="shader")
  parser.add_option("-n","--no-gui", action="store_true", dest="no_gui",
                  help="Be moderately verbose")
  
  (options, args) = parser.parse_args()

  if options.shader is not None:
    print(Shader.getShader(options.shader,set(options.shader)))
    exit()

  if not options.no_gui:
    app = QtGui.QApplication(['Dome'])
    glutInit(sys.argv)
    window = DomeGUI()
    window.show()
    sys.exit(app.exec_())

