uniform float a_top; // 0.05
uniform float a_left_side; // 0.05
uniform float a_right_side; // 0.05
uniform float a_edge_gamma; // 1.0
uniform float b_top; // 0.05
uniform float b_left_side; // 0.05
uniform float b_right_side; // 0.05
uniform float b_edge_gamma; // 1.0
uniform float c_top; // 0.05
uniform float c_left_side; // 0.05
uniform float c_right_side; // 0.05
uniform float c_edge_gamma; // 1.0

/// All zero initially
uniform float b_a_edge_offset; // 0.00
uniform float b_a_edge_blur; 
uniform float b_a_squeeze_left;
uniform float b_a_squeeze_right;
uniform float b_a_squeeze_top;
uniform float b_a_squeeze_bottom;
uniform float c_a_edge_offset; // 0.00
uniform float c_a_edge_blur; // 0.05
uniform float c_a_squeeze_left;
uniform float c_a_squeeze_right;
uniform float c_a_squeeze_top;
uniform float c_a_squeeze_bottom;
uniform float c_b_edge_offset; // 0.00
uniform float c_b_edge_blur; // 0.05
uniform float c_b_squeeze_left;
uniform float c_b_squeeze_right;
uniform float c_b_squeeze_top;
uniform float c_b_squeeze_bottom;

uniform float mask; // between 0.0 and 1.0
uniform float smart_edge; // <0.0 = off, >=0.0 on

struct Edgeblend
{
  float top, left_side, right_side, gamma;
};

Edgeblend Edgeblend_construct(
    float top,
    float left_side,
    float right_side,
    float gamma)
{
  Edgeblend edgeblend;
  edgeblend.top = top;
  edgeblend.left_side = left_side;
  edgeblend.right_side = right_side;
  edgeblend.gamma = gamma;
  return edgeblend;
} 

float Edgeblend_edgeValue(in Edgeblend edgeblend, in vec2 coord)
{
  float edgeValue = 1.0;

  if (coord.x <= edgeblend.left_side)
  {
    edgeValue *= min(coord.x / edgeblend.left_side, 1.0);
  } else
  if (coord.x >= 1.0 - edgeblend.right_side)
  {
    edgeValue *= min((1.0 - coord.x) / edgeblend.right_side, 1.0);
  }
  if (1.0 - coord.y <= edgeblend.top)
  {
    edgeValue *= min((1.0 - coord.y) / edgeblend.top, 1.0);
  }
  return 1.0 - pow(clamp(edgeValue,0.0,1.0),edgeblend.gamma);
}

vec4 Edgeblend_color(in Edgeblend edgeblend, in float value)
{
  float mv = mask*value;
  return vec4(mv,mv,mv,mask + value); 
}

