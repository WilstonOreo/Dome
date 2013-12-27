#include "projection.h"

uniform float proj_fov; // 68.2 is default
uniform float proj_aspect_ratio; // 0.75 is default
uniform float tower_height;
/// Range from -90.0 to 90.0
uniform float pitch_angle;

/// Projector measurements
uniform float a_distance_center;
uniform float b_distance_center;
uniform float c_distance_center;
uniform float d_distance_center;

/// Those should all be zero, if not fine-tuned
/// Range from -1.0 to 1.0
uniform float a_delta_height; 
uniform float b_delta_height;
uniform float c_delta_height;
uniform float d_delta_height;

/// Range from -45.0 to 45.0 deg
uniform float a_delta_pitch;
uniform float b_delta_pitch;
uniform float c_delta_pitch;
uniform float d_delta_pitch;
uniform float a_delta_yaw;
uniform float b_delta_yaw;
uniform float c_delta_yaw;
uniform float d_delta_yaw;

/// Range from -10.0 to 10.0 deg
uniform float a_roll;
uniform float b_roll;
uniform float c_roll;
uniform float d_roll;

/// Range from -3.0 to 3.0 
uniform float a_shift;
uniform float b_shift;
uniform float c_shift;
uniform float d_shift;

uniform float a_alpha;
uniform float b_alpha;
uniform float c_alpha;
uniform float d_alpha;

uniform float a_gamma;
uniform float b_gamma;
uniform float c_gamma;
uniform float d_gamma;

uniform float selected_proj;

Projector ProjectorA_construct()
{
  vec3 pos = vec3(a_shift,-a_distance_center,-a_delta_height - tower_height);
  return Projector_construct(
    proj_fov,
    proj_aspect_ratio,
    a_alpha,
    a_gamma,
    pos,
    -90.0 + a_delta_yaw,
    a_delta_pitch + pitch_angle,
    a_roll);
}


Projector ProjectorB_construct()
{
  vec3 pos = vec3(b_distance_center,b_shift,-b_delta_height - tower_height);
  return Projector_construct(
    proj_fov,
    proj_aspect_ratio,
    b_alpha,
    b_gamma,
    pos,
    -180.0 + b_delta_yaw,
    b_delta_pitch + pitch_angle,
    b_roll);
}

Projector ProjectorC_construct()
{
  vec3 pos = vec3(c_shift,c_distance_center,-c_delta_height - tower_height);
  return Projector_construct(
    proj_fov,
    proj_aspect_ratio,
    c_alpha,
    c_gamma,
    pos,
    -270.0 + c_delta_yaw,
    c_delta_pitch + pitch_angle,
    c_roll);
}

Projector ProjectorD_construct()
{
  vec3 pos = vec3(-d_distance_center,d_shift,-d_delta_height - tower_height);
  return Projector_construct(
    proj_fov,
    proj_aspect_ratio,
    d_alpha,
    d_gamma,
    pos,
    -360.0 + d_delta_yaw,
    d_delta_pitch + pitch_angle,
    d_roll);
}

Ray constructFromCoords(in vec2 coord, out Projector proj)
{
  vec2 outCoord = coord;
  int idx = 0;
  if (selected_proj < 0.0)
  {
    outCoord.x *= 4.0;
    idx = int(floor(outCoord.x));
  } else
  {
    idx = int(selected_proj);
  }
  
/// Projector A
  if (idx == 0)
  {
    proj = ProjectorA_construct();
  } else
/// Projector B
  if (idx == 1)
  {
    proj = ProjectorB_construct();
  } else
/// Projector C
  if (idx == 2)
  {
    proj = ProjectorC_construct();
  } else
  if (idx == 3)
  {
    proj = ProjectorD_construct();
  }

  outCoord.x = 1.0 - fract(outCoord.x);
  Frustum f = Frustum_construct(proj);
  Ray ray = Frustum_ray(f,outCoord);
  return ray;
}
