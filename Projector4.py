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

from Projector import Projector

class Projectors3(SceneObject):
  def __init__(self,
      a,b,c, # Projectors
      distance_a_b,
      distance_a_c,
      height,
      yawAngle,
      pitchAngle,
      fov = 68.2,aspectRatio = 0.75):
    SceneObject.__init__(self,Point3D(),GL_FLAT,False)
    self.a = a
    self.b = b
    self.c = c
    self.distance_a_b = distance_a_b
    self.distance_a_c = distance_a_c
    self.yawAngle = yawAngle
    self.pitchAngle = pitchAngle
    self.aspectRatio = aspectRatio
    self.fov = fov
    self.height = height
    self.draw = True

  def getPositionA(self):
    return Point3D(-self.a.distance_center,self.a.shift,-self.height - self.a.deltaHeight);

  def draw(self,dome,colors):
    if not self.draw: return
    glPushMatrix()
    glTranslatef(0,0,-dome.radius)
    length = dome.radius
    theta = math.radians(self.yawAngle)
    posRadius = dome.innerRadius + self.offset.y()
    self.position = getPosition(self.offset.x(),0,self.yawAngle - 90.0) + getPosition(posRadius,(dome.radius - self.towerHeight),self.yawAngle)

    #self.__drawA(colors[0])

    glPopMatrix()

  def shaderSettings(self,shader):
    shader.set(
        proj_fov = ("1f",[self.fov]),
        proj_aspect_ratio = ("1f",[self.aspectRatio]),
        proj_yaw = ("1f",[self.yawAngle]),
        a_alpha = ("1f",[1.0]),
        b_alpha = ("1f",[1.0]),
        c_alpha = ("1f",[1.0]),
        a_gamma = ("1f",[1.0]),
        b_gamma = ("1f",[1.0]),
        c_gamma = ("1f",[1.0]),
        a_distance_center = ("1f",[self.a.distance_center]),
        b_distance_center = ("1f",[self.b.distance_center]),
        c_distance_center = ("1f",[self.c.distance_center]),
        tower_height = ("1f",[self.height]),
        pitch_angle = ("1f",[self.pitchAngle]),
        a_delta_yaw = ("1f",[self.a.deltaYaw]),
        b_delta_yaw = ("1f",[self.b.deltaYaw]),
        c_delta_yaw = ("1f",[self.c.deltaYaw]),
        a_delta_height = ("1f",[self.a.deltaHeight]),
        b_delta_height = ("1f",[self.b.deltaHeight]),
        c_delta_height = ("1f",[self.c.deltaHeight]),
        a_delta_pitch = ("1f",[self.a.deltaPitch]),
        b_delta_pitch = ("1f",[self.b.deltaPitch]),
        c_delta_pitch = ("1f",[self.c.deltaPitch]),
        a_roll = ("1f",[self.a.roll]),
        b_roll = ("1f",[self.b.roll]),
        c_roll = ("1f",[self.c.roll]),
        a_shift = ("1f",[self.a.shift]),
        b_shift  = ("1f",[self.b.shift]),
        c_shift = ("1f",[self.c.shift]))

  def edgeBlendShaderSettings(self,shader):
    shader.set(
        a_top = ("1f",[self.a.edgeBlendTopLeftRight]),
        a_edge_gamma = ("1f",[self.a.edgeBlendGamma]),
        a_left_side = ("1f",[self.a.edgeBlendTopLeftRight]),
        a_right_side = ("1f",[self.a.edgeBlendTopLeftRight]),
        b_top = ("1f",[self.b.edgeBlendTopLeftRight]),
        b_edge_gamma = ("1f",[self.b.edgeBlendGamma]),
        b_left_side = ("1f",[self.b.edgeBlendTopLeftRight]),
        b_right_side = ("1f",[self.b.edgeBlendTopLeftRight]),
        c_top = ("1f",[self.c.edgeBlendTopLeftRight]),
        c_edge_gamma = ("1f",[self.c.edgeBlendGamma]),
        c_left_side = ("1f",[self.c.edgeBlendTopLeftRight]),
        c_right_side = ("1f",[self.c.edgeBlendTopLeftRight]),
        b_a_edge_blur = ("1f",[self.a.edgeBlendBlur]),
        b_a_edge_offset = ("1f",[self.a.edgeBlendOffset]),
        c_a_edge_blur = ("1f",[self.a.edgeBlendBlur]),
        c_a_edge_offset = ("1f",[self.a.edgeBlendOffset]),
        c_b_edge_blur = ("1f",[self.b.edgeBlendBlur]),
        c_b_edge_offset = ("1f",[self.b.edgeBlendOffset]),
        b_a_squeeze_left = ("1f",[0.0]),
        b_a_squeeze_right = ("1f",[0.0]),
        b_a_squeeze_top = ("1f",[0.0]),
        b_a_squeeze_bottom = ("1f",[0.0]),
        c_a_squeeze_left = ("1f",[0.0]),
        c_a_squeeze_right = ("1f",[0.0]),
        c_a_squeeze_top = ("1f",[0.0]),
        c_a_squeeze_bottom = ("1f",[0.0]),
        c_b_squeeze_left = ("1f",[0.0]),
        c_b_squeeze_right = ("1f",[0.0]),
        c_b_squeeze_top = ("1f",[0.0]),
        c_b_squeeze_bottom = ("1f",[0.0]),
        mask = ("1f",[0.0]),
        smart_edge = ("1f",[1.0])
        )

