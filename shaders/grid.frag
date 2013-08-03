uniform float clock;
uniform vec2 offset;
uniform vec2 num_lines;
uniform float line_thickness;

vec3 grid(in vec2 texCoords)
{
  vec2 off = num_lines * (texCoords - offset) + vec2(0.0,clock);
  if ((off.x <= line_thickness*num_lines.x && off.x >= 0.0) || 
      (off.y <= line_thickness*num_lines.y && off.y >= 0.0) return vec3(1.0,1.0,1.0);
  return vec3(0.0,0.0,0.0);
}


void main()
{
  vec3 color = grid(gl_TexCoord[0].st);

  /// Look up for color type in rgb
  gl_FragColor.r = color.x;
  gl_FragColor.g = color.y;
  gl_FragColor.b = color.z;

  gl_FragColor.a = 1.0;
}
