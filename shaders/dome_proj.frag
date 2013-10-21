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

/// Our texture
uniform sampler2D proj_texture;

#include "3_proj_params.h"
#include "dome_params.h"

void main()
{
  Projector proj;
  Ray ray = constructFromCoords(gl_TexCoord[0].st,proj);
  Dome dome = Dome_construct();

  vec2 texCoords;
  if (Dome_texCoords(dome,ray,texCoords) < 1.0) 
  {
    gl_FragColor = vec4(0.0,0.0,0.0,0.0);
    return;
  }

  gl_FragColor = Projector_color(proj,texture2D(proj_texture, texCoords)); 
}

