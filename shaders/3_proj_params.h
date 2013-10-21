#include "projection.h"

uniform float proj_fov; // 68.2 is default
uniform float proj_aspect_ratio; // 0.75 is default
uniform float tower_height;
/// Range from -90.0 to 90.0
uniform float pitch_angle;

/// Projector measurements

uniform float b_yaw;
uniform float c_yaw;

uniform float a_distance_center;
uniform float b_distance_center;
uniform float c_distance_center;

/// Those should all be zero, if not fine-tuned
/// Range from -1.0 to 1.0
uniform float a_delta_height; 
uniform float b_delta_height;
uniform float c_delta_height;

/// Range from -45.0 to 45.0 deg
uniform float a_delta_pitch;
uniform float b_delta_pitch;
uniform float c_delta_pitch;
uniform float a_delta_yaw;
uniform float b_delta_yaw;
uniform float c_delta_yaw;

/// Range from -10.0 to 10.0 deg
uniform float a_roll;
uniform float b_roll;
uniform float c_roll;

/// Range from -3.0 to 3.0 
uniform float a_shift;
uniform float b_shift;
uniform float c_shift;

uniform float a_alpha;
uniform float b_alpha;
uniform float c_alpha;
uniform float a_gamma;
uniform float b_gamma;
uniform float c_gamma;


Projector ProjectorA_construct()
{
  vec3 pos = vec3(-a_distance_center,a_shift,-a_delta_height - tower_height);
  return Projector_construct(
    proj_fov,
    proj_aspect_ratio,
    a_alpha,
    a_gamma,
    pos,
    a_delta_yaw,
    a_delta_pitch + pitch_angle,
    a_roll);
}

Projector ProjectorB_construct()
{
  float yaw = b_yaw;
  float theta = deg2rad(yaw);
  vec2 p = b_distance_center*vec2(-cos(theta),sin(theta));
  float ct = cos(theta), st = sin(theta);
  vec2 shiftVec = normalize(vec2(st,ct)) * b_shift;  
  vec3 pos =  vec3(p + shiftVec,- b_delta_height - tower_height);

  return Projector_construct(
    proj_fov,
    proj_aspect_ratio,
    b_alpha,
    b_gamma,
    pos,
    b_delta_yaw + yaw,
    b_delta_pitch + pitch_angle,
    b_roll);
}

Projector ProjectorC_construct()
{
  float yaw = c_yaw;
  float theta = deg2rad(yaw);
  vec2 p = c_distance_center*vec2(-cos(theta),sin(theta));
  float ct = cos(theta), st = sin(theta);
  vec2 shiftVec = normalize(vec2(st,ct)) * c_shift;  
  vec3 pos =  vec3(p + shiftVec,- c_delta_height - tower_height);

  return Projector_construct(
    proj_fov,
    proj_aspect_ratio,
    c_alpha,
    c_gamma,
    pos,
    c_delta_yaw + yaw,
    c_delta_pitch + pitch_angle,
    c_roll);
}

Ray constructFromCoords(in vec2 coord, out Projector proj)
{
  vec2 outCoord = coord;
  outCoord.x *= 3.0;
  int idx = int(floor(outCoord.x));
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
  }
  outCoord.x = 1.0 - fract(outCoord.x);
  Frustum f = Frustum_construct(proj);
  Ray ray = Frustum_ray(f,outCoord);
  return ray;
}

