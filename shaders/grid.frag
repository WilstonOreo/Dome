uniform float clock;
uniform vec2 offset;
uniform vec2 num_lines;
uniform float line_thickness;

vec3 grid(in vec2 texCoords)
{
  vec2 off = num_lines * (texCoords - offset) + vec2(0.0,clock);
  off = vec2(fract(off.x),fract(off.y));
  
  if (off.y <= line_thickness && off.y >= 0.0 && num_lines.y > 0.0) return vec3(1.0,1.0,1.0);
  if (off.x <= line_thickness && off.x >= 0.0 && num_lines.x > 0.0) return vec3(0.0,0.0,1.0);
  return vec3(0.0,0.0,0.0);
}
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

void main()
{
  vec3 color = grid(gl_TexCoord[0].st);

  /// Look up for color type in rgb
  gl_FragColor.r = color.x;
  gl_FragColor.g = color.y;
  gl_FragColor.b = color.z;

  gl_FragColor.a = 1.0;
}

