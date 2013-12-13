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
#include "4_proj_params.h"
#include "edgeblend_4proj.h"

void main()
{
  vec2 coord = gl_TexCoord[0].st;
  float valid = 1.0;
  Edgeblend edgeblend;
  Projector projA = ProjectorA_construct(),
            projB = ProjectorB_construct(), 
            projC = ProjectorC_construct(), 
            projD = ProjectorD_construct();

  Frustum 
    frustumA = Frustum_construct(projA,a_squeeze_left,a_squeeze_right,a_squeeze_top,a_squeeze_bottom),
    frustumB = Frustum_construct(projB,b_squeeze_left,b_squeeze_right,b_squeeze_top,b_squeeze_bottom),
    frustumC = Frustum_construct(projC,c_squeeze_left,c_squeeze_right,c_squeeze_top,c_squeeze_bottom),
    frustumD = Frustum_construct(projD,d_squeeze_left,d_squeeze_right,d_squeeze_top,d_squeeze_bottom),
    frustum;

  int idx = 0;
  if (selected_proj < 0.0)
  {
    coord.x *= 4.0;
    idx = int(floor(coord.x));
  } else
  {
    idx = int(selected_proj);
  }

  if (idx == 0) // Projector a 
  {
    frustum = Frustum_construct(projA); 
    edgeblend = Edgeblend_construct(a_top, a_left_side, a_right_side, a_edge_gamma);
  } else
  if (idx == 1) // Projector b
  {
    frustum = Frustum_construct(projB);
    edgeblend = Edgeblend_construct(b_top, b_left_side, b_right_side, b_edge_gamma);
  } else
  if (idx == 2) // Projector c
  {
    frustum = Frustum_construct(projC); 
    edgeblend = Edgeblend_construct(c_top, c_left_side, c_right_side, c_edge_gamma);
  } else
  if (idx == 3) // Projector d
  {
    frustum = Frustum_construct(projD); 
    edgeblend = Edgeblend_construct(d_top, d_left_side, d_right_side, d_edge_gamma);
  }

  coord.x = 1.0 - fract(coord.x);
  float edgeValue = Edgeblend_edgeValue(edgeblend,coord);
  Dome dome = Dome_construct();
  Ray ray = Frustum_ray(frustum,coord);

  vec3 iPoint;
  float intersection = Dome_intersection(dome,ray,iPoint);  

  if (intersection < 0.0) 
  {
    gl_FragColor = Edgeblend_color(edgeblend,0.0);
    return;
  }

  float frustumIntersection = -10000.0; 
  float edgeOffsetA = a_edge_offset + 0.5 * a_edge_blur; 
  float edgeOffsetB = b_edge_offset + 0.5 * b_edge_blur;
  float edgeOffsetC = c_edge_offset + 0.5 * c_edge_blur;
  float edgeOffsetD = d_edge_offset + 0.5 * d_edge_blur;
  float intersectionA = clamp((Frustum_intersection(frustumA,iPoint,edgeOffsetA*dome.diameter) / dome.diameter + edgeOffsetA) / a_edge_blur,0.0,1.0);
  float intersectionB = clamp((Frustum_intersection(frustumB,iPoint,edgeOffsetB*dome.diameter) / dome.diameter + edgeOffsetB) / b_edge_blur,0.0,1.0);
  float intersectionC = clamp((Frustum_intersection(frustumC,iPoint,edgeOffsetC*dome.diameter) / dome.diameter + edgeOffsetC) / c_edge_blur,0.0,1.0);
  float intersectionD = clamp((Frustum_intersection(frustumD,iPoint,edgeOffsetD*dome.diameter) / dome.diameter + edgeOffsetD) / d_edge_blur,0.0,1.0);

  if (idx == 0) // Projector a 
  {
    frustumIntersection = 0.0;
    if ((edgeValue > 0.0) && (smart_edge > 0.0))
    {
      edgeValue *= intersectionB + intersectionC + intersectionD;
    }
  } else
  if (idx == 1) // Projector b
  {
    frustumIntersection = intersectionA;
    if ((edgeValue > 0.0) && (smart_edge > 0.0))
    {
      edgeValue *= intersectionC + intersectionD;
    }
  } else
  if (idx == 2) // Projector c
  {
    frustumIntersection = max(intersectionA,intersectionB); 
    if ((edgeValue > 0.0) && (smart_edge > 0.0)) 
    {
      edgeValue *= intersectionD;
    }
  } else
  if (idx == 3) // Projector d
  {
    frustumIntersection = max(intersectionA,max(intersectionB,intersectionC)); 
    if (smart_edge > 0.0) 
    {
      edgeValue = 0.0;
    }
  }

  float frustumValue = pow(clamp(frustumIntersection,0.0,1.0),edgeblend.gamma);
  float value = clamp(frustumValue + edgeValue,0.0,1.0);
  gl_FragColor = Edgeblend_color(edgeblend,value);
}

