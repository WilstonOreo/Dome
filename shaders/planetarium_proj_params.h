#include "projection.h"

uniform float proj_fov; // 68.2 is default
uniform float proj_aspect_ratio; // 0.75 is default
uniform float tower_height;

/// Projector measurements

uniform float b_yaw;
uniform float c_yaw;

uniform float a_distance_center;
uniform float b_distance_center;
uniform float c_distance_center;

/// Range from -90.0 to 90.0
uniform float pitch_angle;

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

float getYawAngle(in vec2 v)
{
  return rad2deg(atan(v.y,-v.x));
}

vec3 ProjectorA_pos()
{
  return vec3(-a_distance_center,0.0,-a_delta_height);
}

Projector ProjectorA_construct()
{
  vec3 pos = ProjectorA_pos() + vec3(a_offset,0.0);
  return Projector_construct(
    proj_fov,
    proj_aspect_ratio,
    pos,
    a_delta_yaw,
    a_delta_pitch + pitch_angle,
    a_roll);
}


Projector ProjectorB_construct(out float valid)
{
  valid = 1.0;
  float yaw = b_yaw;
  float theta = deg2rad(yaw);
  vec2 p = b_distance_center*vec2(-cos(theta),sin(theta));
  vec3 pos =  vec3(p + b_offset,- b_delta_height);

  return Projector_construct(
    proj_fov,
    proj_aspect_ratio,
    pos,
    b_delta_yaw + yaw,
    b_delta_pitch + pitch_angle,
    b_roll);
}

Projector ProjectorC_construct(out float valid)
{
  valid = 1.0;
  float yaw = c_yaw;
  float theta = deg2rad(yaw);
  vec2 p = c_distance_center*vec2(-cos(theta),sin(theta));
  vec3 pos =  vec3(p + c_offset,- c_delta_height);

  return Projector_construct(
    proj_fov,
    proj_aspect_ratio,
    pos,
    c_delta_yaw + yaw,
    c_delta_pitch + pitch_angle,
    c_roll);
}

