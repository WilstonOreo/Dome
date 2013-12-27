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

#include "canvas.h"
#include "edgeblend.h"

void main()
{
  gl_FragColor = vec4(0.0,0.0,0.0,0.0);
  
  float border = edgeblend_border(gl_TexCoord[0].st);
  
  if (canvas_params(gl_TexCoord[0].st) < 0.0)
  {
    gl_FragColor = edgeblend_color(border);
    return;
  }

  float frustum = edgeblend_frustum(canvas.iPoint,canvas.diameter);

  gl_FragColor = edgeblend_color(frustum + border);
}

