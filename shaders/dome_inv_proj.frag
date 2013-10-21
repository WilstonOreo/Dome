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

#include "projection.h"
#include "spherical.h"

/// Our texture
uniform sampler2D proj_texture;

#include "dome_params.h"
#include "3_proj_params.h"

uniform vec4 proj_multi;



void main()
{
  //gl_FragColor = vec4(0.0,0.0,0.0,0.0);

  //if (proj_multi.w > 0.0)
  {
    gl_FragColor = texture2D(proj_texture,gl_TexCoord[0].st);
    gl_FragColor.a = 0.5;
  }/* else
  {
    gl_FragColor = vec4(0.0,0.0,0.0,0.5);
  }*/

  float valid = 1.0;
  Dome dome = Dome_construct();
  Projector projA = ProjectorA_construct();
  Projector projB = ProjectorB_construct();
  if (valid < 0.0) 
  {
    return;
  }
  Projector projC = ProjectorC_construct();
  if (valid < 0.0) return;

  Frustum frustumA = Frustum_construct(projA),
          frustumB = Frustum_construct(projB),
          frustumC = Frustum_construct(projC);
  vec3 point = Dome_point(dome,gl_TexCoord[0].st);
  
  float a_intersect = (Frustum_intersection(frustumA,point) >= 0.0) ? 1.0 : 0.0;
  float b_intersect = (Frustum_intersection(frustumB,point) >= 0.0) ? 1.0 : 0.0;
  float c_intersect = (Frustum_intersection(frustumC,point) >= 0.0) ? 1.0 : 0.0;
  
  gl_FragColor.r += proj_multi.x * a_intersect;
  gl_FragColor.g += proj_multi.y * b_intersect;
  gl_FragColor.b += proj_multi.z * c_intersect;
 /* gl_FragColor.a += a_intersect / 6.0;
  gl_FragColor.a += b_intersect / 6.0;
  gl_FragColor.a += c_intersect / 6.0;*/
}

