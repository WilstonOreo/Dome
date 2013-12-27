
uniform float overlap_proj_fov; // 68.2 is default
uniform float overlap_proj_aspect_ratio; // 0.75 is default
uniform float overlap_proj_distance_center;
uniform float overlap_proj_shift;
uniform float overlap_proj_tower_height;

/// Range from -90.0 to 90.0
uniform float overlap_proj_yaw;
uniform float overlap_proj_delta_yaw;
uniform float overlap_proj_pitch;
uniform float overlap_proj_roll;

uniform float overlap_squeeze_left;
uniform float overlap_squeeze_right;
uniform float overlap_squeeze_top;
uniform float overlap_squeeze_bottom;
uniform float overlap_edge_offset;

uniform float top;
uniform float left;
uniform float right;
uniform float edge_blur;
uniform float mask;
uniform float gamma;

Projector overlap_proj;

void overlap_proj_params()
{
  float yaw = overlap_proj_yaw;
  float theta = deg2rad(yaw);
  vec2 p = overlap_proj_distance_center*vec2(-cos(theta),sin(theta));
  float ct = cos(theta), st = sin(theta);
  vec2 shiftVec = normalize(vec2(st,ct)) * overlap_proj_shift;  
  vec3 pos =  vec3(p + shiftVec,- overlap_proj_tower_height);
  overlap_proj = Projector_construct(
      overlap_proj_fov,
      overlap_proj_aspect_ratio,
      pos,
      overlap_proj_delta_yaw + yaw,
      overlap_proj_pitch,
      overlap_proj_roll);
}

Frustum overlap_proj_frustum()
{
  return Frustum_construct(overlap_proj,overlap_squeeze_left,overlap_squeeze_right,overlap_squeeze_top,overlap_squeeze_bottom);
}

float edgeblend_border(in vec2 coord)
{
  float edgeValue = 1.0;

  if (coord.x <= left)
  {
    edgeValue *= min(coord.x / left, 1.0);
  } else
  if (coord.x >= 1.0 - right)
  {
    edgeValue *= min((1.0 - coord.x) / right, 1.0);
  }
  if (1.0 - coord.y <= top)
  {
    edgeValue *= min((1.0 - coord.y) / top, 1.0);
  }
  return 1.0 - pow(clamp(edgeValue,0.0,1.0),gamma);
}

vec4 edgeblend_color(in float value)
{
  float v = clamp(value,0.0,1.0);
  if (mask < 0.0)
  {
  	return vec4(0.0,0.0,0.0,v); 
  }
  float mv = 1.0 - v;  
  return vec4(mv,mv,mv,1.0); 
}

float edgeblend_frustum(in vec3 iPoint, float diameter)
{
  float edgeOffset = overlap_edge_offset + 0.5 * edge_blur;
  overlap_proj_params();
  Frustum frustum = overlap_proj_frustum();

  float frustumIntersection = (Frustum_intersection(frustum,iPoint,edgeOffset*diameter) / diameter + edgeOffset) / edge_blur;
  
  return pow(clamp(frustumIntersection,0.0,1.0),gamma);
}

