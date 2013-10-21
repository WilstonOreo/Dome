/******************************************************************
    This file is part of CycloramaSimulator.

    CycloramaSimulator is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    CycloramaSimulator is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with CycloramaSimulator.  If not, see <http://www.gnu.org/licenses/>.

    CycloramaSimulator is free for non-commercial use. If you want to use it 
    commercially, you should contact the author 
    Michael Winkelmann aka Wilston Oreo by mail:
    me@wilstonoreo.net
**************************************************************************/
#version 120

#include "cyclorama_params.h"
#include "3_proj_params.h"
#include "edgeblend.h"

void main()
{
  vec2 coord = vec2(gl_TexCoord[0].s*3.0,gl_TexCoord[0].t);
  Edgeblend edgeblend;
  Projector projA = ProjectorA_construct();
  Projector projB = ProjectorB_construct();
  Projector projC = ProjectorC_construct();

  Frustum frustum;

  int idx = int(floor(coord.x));

  if (idx == 0) // Projector a 
  {
    frustum = Frustum_construct(projA);
    edgeblend = Edgeblend_construct(a_top, a_left_side, a_right_side, a_gamma);
  } else
  if (idx == 1) // Projector b
  {
    frustum = Frustum_construct(projB);
    edgeblend = Edgeblend_construct(b_top, b_left_side, b_right_side, b_gamma);
  } else
  if (idx == 2) // Projector c
  {
    frustum = Frustum_construct(projC);
    edgeblend = Edgeblend_construct(c_top, c_left_side, c_right_side, c_gamma);
  }

  coord.x = 1.0 - fract(coord.x);
  float edgeValue = Edgeblend_edgeValue(edgeblend,coord);

  Cyclorama cyclorama = Cyclorama_construct();
  Ray ray = Frustum_ray(frustum,coord);
  if (Cyclorama_texCoords(cyclorama,ray,coord) < 0.0) 
  {
    gl_FragColor = Color_None;
    return;
  }

  vec3 iPoint;
  float intersection = Cyclorama_intersection(cyclorama,ray,iPoint);  
  if (intersection < 0.0) 
  {
    gl_FragColor = Color_None;
    return;
  }
  
  float frustumIntersection = -10000.0; 
 
  if (idx == 0) // Projector a 
  {
    frustumIntersection = 0.0;
  } else
  if (idx == 1) // Projector b
  {
    Frustum overlapA = Frustum_construct(projA,b_a_squeeze_left,b_a_squeeze_right,b_a_squeeze_top,b_a_squeeze_bottom); 
    float edgeOffset = b_a_edge_offset + 0.5 * b_a_edge_blur;
    frustumIntersection = (Frustum_intersection(overlapA,iPoint,edgeOffset*cyclorama.diameter) / cyclorama.diameter + edgeOffset) / b_a_edge_blur;
  } else
  if (idx == 2) // Projector c
  {
    Frustum overlapA = Frustum_construct(projA,c_a_squeeze_left,c_a_squeeze_right,c_a_squeeze_top,c_a_squeeze_bottom);
    Frustum overlapB = Frustum_construct(projB,c_b_squeeze_left,c_b_squeeze_right,c_b_squeeze_top,c_b_squeeze_bottom);
    float edgeOffsetA = c_a_edge_offset + c_a_edge_blur * 0.5;
    float edgeOffsetB = c_b_edge_offset + c_b_edge_blur * 0.5;
    float frustumIntersectionA = (Frustum_intersection(overlapA,iPoint,edgeOffsetA*cyclorama.diameter) / cyclorama.diameter + edgeOffsetA) / 
                                  c_a_edge_blur;
    float frustumIntersectionB = (Frustum_intersection(overlapB,iPoint,edgeOffsetB*cyclorama.diameter) / cyclorama.diameter + edgeOffsetB) / 
                                  c_b_edge_blur;
    frustumIntersection = max(frustumIntersectionA,frustumIntersectionB); 
  }

  float frustumValue = pow(clamp(frustumIntersection,0.0,1.0),edgeblend.gamma);

  float value = clamp(frustumValue + edgeValue,0.0,1.0);
  gl_FragColor = vec4(0.0,0.0,0.0,value);
}

