/******************************************************************
    This file is part of PlanetariumSimulator.

    PlanetariumSimulator is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    PlanetariumSimulator is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with PlanetariumSimulator.  If not, see <http://www.gnu.org/licenses/>.

    PlanetariumSimulator is free for non-commercial use. If you want to use it 
    commercially, you should contact the author 
    Michael Winkelmann aka Wilston Oreo by mail:
    me@wilstonoreo.net
**************************************************************************/
#version 120

#include "planetarium_params.h"
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
    edgeblend = Edgeblend_construct(a_top, a_left_side, a_right_side, a_gamma);
  } else
  if (idx == 1) // Projector b
  {
    frustum = frustumB;
    edgeblend = Edgeblend_construct(b_top, b_left_side, b_right_side, b_gamma);
  } else
  if (idx == 2) // Projector c
  {
    frustum = frustumC; 
    edgeblend = Edgeblend_construct(c_top, c_left_side, c_right_side, c_gamma);
  }

  edgeblend.top = 0.0;
  edgeblend.left_side = 0.0;
  edgeblend.right_side = 0.0;

  coord.x = 1.0 - fract(coord.x);
  float edgeValue = Edgeblend_edgeValue(edgeblend,coord);
  Planetarium planetarium = Planetarium_construct();
  Ray ray = Frustum_ray(frustum,coord);
  if ((Planetarium_texCoords(planetarium,ray,coord) < 0.0) || (valid < 0.0)) 
  {
    gl_FragColor = vec4(0.0,0.0,0.0,0.0);
    return;
  }

  vec3 iPoint;
  float intersection = Planetarium_intersection(planetarium,ray,iPoint);  
  if (intersection < 0.0) 
  {
    gl_FragColor = Color_None;
    return;
  }

  float frustumIntersection = 0.0; 
  if (idx == 0) // Projector A
  {
    float edgeOffset = b_a_edge_offset + 0.5 * b_a_edge_blur;
    edgeValue = 1.0 - (Frustum_intersection(frustumA,iPoint,edgeOffset*planetarium.diameter)) *  
    (Frustum_intersection(frustumB,iPoint,-edgeOffset*planetarium.diameter) / planetarium.diameter + edgeOffset) / b_a_edge_blur;

    gl_FragColor = vec4(0.0,0.0,0.0,pow(clamp(edgeValue,0.0,1.0),edgeblend.gamma));
    return;
  } else
  if (idx == 1) // Projector b
  {
    float edgeOffset = b_a_edge_offset + 0.5 * b_a_edge_blur;
    frustumIntersection = (Frustum_intersection(frustumA,iPoint,edgeOffset*planetarium.diameter) / planetarium.diameter + edgeOffset) / b_a_edge_blur;
  } else
  if (idx == 2) // Projector c
  {
    float edgeOffsetA = c_a_edge_offset + c_a_edge_blur * 0.5;
    float edgeOffsetB = c_b_edge_offset + c_b_edge_blur * 0.5;

    float invDiameter = 1.0 / planetarium.diameter;
    float frustumIntersectionA = (Frustum_intersection(frustumA,iPoint,edgeOffsetA*planetarium.diameter) * invDiameter + edgeOffsetA) / 
                                  c_a_edge_blur;
    float frustumIntersectionB = (Frustum_intersection(frustumB,iPoint,edgeOffsetB*planetarium.diameter) * invDiameter + edgeOffsetB) / 
                                  c_b_edge_blur;
    frustumIntersection = max(frustumIntersectionA,frustumIntersectionB); 
  }

  float frustumValue = clamp(frustumIntersection,0.0,1.0);
  float value = pow(clamp(frustumValue + edgeValue,0.0,1.0),edgeblend.gamma);
  gl_FragColor = vec4(0.0,0.0,0.0,value);
}

