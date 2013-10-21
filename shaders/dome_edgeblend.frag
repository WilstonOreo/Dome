/******************************************************************
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
**************************************************************************/

#include "dome_params.h"
#include "3_proj_params.h"
#include "edgeblend.h"

void main()
{
  vec2 coord = gl_TexCoord[0].st;
  coord.x *= 3.0;
  float valid = 1.0;
  valid = 1.0;
  Edgeblend edgeblend;
  Projector projA = ProjectorA_construct(),
            projB = ProjectorB_construct(), 
            projC = ProjectorC_construct();

  Frustum 
    frustumA = Frustum_construct(projA),
    frustumB = Frustum_construct(projB),
    frustumC = Frustum_construct(projC),
    frustum;

  int idx = int(floor(coord.x));
  
  if (idx == 0) // Projector a 
  {
    frustum = frustumA; 
    edgeblend = Edgeblend_construct(a_top, a_left_side, a_right_side, a_edge_gamma);
  } else
  if (idx == 1) // Projector b
  {
    frustum = frustumB;
    edgeblend = Edgeblend_construct(b_top, b_left_side, b_right_side, b_edge_gamma);
  } else
  if (idx == 2) // Projector c
  {
    frustum = frustumC; 
    edgeblend = Edgeblend_construct(c_top, c_left_side, c_right_side, c_edge_gamma);
  }

  coord.x = 1.0 - fract(coord.x);
  float edgeValue = Edgeblend_edgeValue(edgeblend,coord);

  Dome dome = Dome_construct();
  Ray ray = Frustum_ray(frustum,coord);
  if (Dome_texCoords(dome,ray,coord) < 0.0) 
  {
    gl_FragColor = Color_None;
    return;
  }

  vec3 iPoint;
  float intersection = Dome_intersection(dome,ray,iPoint);  

  if (intersection < 0.0) 
  {
    gl_FragColor = Edgeblend_color(edgeblend,0.0);
    return;
  }

  float frustumIntersection = -10000.0; 
 
  if (idx == 0) // Projector a 
  {
    frustumIntersection = 0.0;
    if ((edgeValue > 0.0) && (smart_edge > 0.0))
    {
      Frustum overlapB = Frustum_construct(projB,b_a_squeeze_left,b_a_squeeze_right,b_a_squeeze_top,b_a_squeeze_bottom);
      Frustum overlapC = Frustum_construct(projC,c_a_squeeze_left,c_a_squeeze_right,c_a_squeeze_top,c_a_squeeze_bottom);
      float edgeOffsetB = b_a_edge_offset + 0.5 * b_a_edge_blur;
      float edgeOffsetC = c_a_edge_offset + 0.5 * c_a_edge_blur;
      float intersectionB = clamp((Frustum_intersection(frustumB,iPoint,-edgeOffsetB*dome.diameter) / dome.diameter + edgeOffsetB) / b_a_edge_blur,0.0,1.0);
      float intersectionC = clamp((Frustum_intersection(frustumC,iPoint,-edgeOffsetC*dome.diameter) / dome.diameter + edgeOffsetC) / c_a_edge_blur,0.0,1.0);
      edgeValue *= (intersectionB + intersectionC);
    }
  } else
  if (idx == 1) // Projector b
  {
    Frustum overlapA = Frustum_construct(projA,b_a_squeeze_left,b_a_squeeze_right,b_a_squeeze_top,b_a_squeeze_bottom); 
      float edgeOffset = b_a_edge_offset + 0.5 * b_a_edge_blur;
    frustumIntersection = (Frustum_intersection(overlapA,iPoint,edgeOffset*dome.diameter) / dome.diameter + edgeOffset) / b_a_edge_blur;
    if ((edgeValue > 0.0) && (smart_edge > 0.0))
    {
      float edgeOffsetC = c_b_edge_offset + c_b_edge_blur * 0.5;
    Frustum overlapC = Frustum_construct(projC,c_b_squeeze_left,c_b_squeeze_right,c_b_squeeze_top,c_b_squeeze_bottom);
      float intersectionC = clamp((Frustum_intersection(frustumC,iPoint,-edgeOffsetC*dome.diameter) / dome.diameter + edgeOffsetC) / c_b_edge_blur,0.0,1.0);
      edgeValue *= intersectionC;
    }
  } else
  if (idx == 2) // Projector c
  {
    Frustum overlapA = Frustum_construct(projA,c_a_squeeze_left,c_a_squeeze_right,c_a_squeeze_top,c_a_squeeze_bottom);
    Frustum overlapB = Frustum_construct(projB,c_b_squeeze_left,c_b_squeeze_right,c_b_squeeze_top,c_b_squeeze_bottom);
    float edgeOffsetA = c_a_edge_offset + c_a_edge_blur * 0.5;
    float edgeOffsetB = c_b_edge_offset + c_b_edge_blur * 0.5;
    float frustumIntersectionA = (Frustum_intersection(overlapA,iPoint,edgeOffsetA*dome.diameter) / dome.diameter + edgeOffsetA) / 
                                  c_a_edge_blur;
    float frustumIntersectionB = (Frustum_intersection(overlapB,iPoint,edgeOffsetB*dome.diameter) / dome.diameter + edgeOffsetB) / 
                                  c_b_edge_blur;
    frustumIntersection = max(frustumIntersectionA,frustumIntersectionB); 
    if (smart_edge > 0.0)
    {
      edgeValue = 0.0;
    }
  }

  float frustumValue = pow(clamp(frustumIntersection,0.0,1.0),edgeblend.gamma);
  float value = clamp(frustumValue + edgeValue,0.0,1.0);
  gl_FragColor = Edgeblend_color(edgeblend,value);
}

