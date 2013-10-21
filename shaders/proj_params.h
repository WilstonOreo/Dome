#include "projection.h"

uniform float proj_fov; // 68.2 is default
uniform float proj_aspect_ratio; // 0.75 is default
uniform float proj_yaw; // Any value allowed

/// Projector measurements

/// Range from 0.0 to 30.0
uniform float distance_a_b;
uniform float distance_a_c;
uniform float a_distance_center;
uniform float b_distance_center;
uniform float c_distance_center;

/// Range from 0.0 to 5.0
uniform float tower_height; // Zero if dome is half sphere

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
uniform vec2 a_offset;
uniform vec2 b_offset;
uniform vec2 c_offset;

float getYawAngle(in vec2 v)
{
  return rad2deg(atan(v.y,v.x));
}

vec3 ProjectorA_pos()
{
  return vec3(-a_distance_center,0,-tower_height - a_delta_height);
}

Projector ProjectorA_construct()
{
  vec3 pos = ProjectorA_pos() + vec3(a_offset,0.0);
  pos = pos * rotateAroundZ(deg2rad(proj_yaw)); 
  return Projector_construct(
    proj_fov,
    proj_aspect_ratio,
    pos,
    -proj_yaw+a_delta_yaw,
    a_delta_pitch + pitch_angle,
    a_roll);
}

Projector ProjectorB_construct(out float valid)
{
  vec3 posA = ProjectorA_pos();
  vec2 first, second;
  valid = intersectionPointsOfCircles(
    posA.xy,
    distance_a_b,
    vec2(0.0,0.0),
    b_distance_center,first,second);

  vec2 p = first;
  float yaw = getYawAngle(-p);
  vec3 pos =  vec3(p,0.0);
  pos += vec3(b_offset,-tower_height - b_delta_height);
  pos = pos * rotateAroundZ(deg2rad(proj_yaw));
  return Projector_construct(
    proj_fov,
    proj_aspect_ratio,
    pos,
    -proj_yaw + b_delta_yaw - yaw,
    b_delta_pitch + pitch_angle,
    b_roll);
}

Projector ProjectorC_construct(out float valid)
{
  vec3 posA = ProjectorA_pos(); 
  vec2 first, second;
  valid = intersectionPointsOfCircles(
    posA.xy,
    distance_a_c,
    vec2(0.0,0.0),
    c_distance_center,first,second);

  vec2 p = second;
  float yaw = getYawAngle(-p);
  vec3 pos =  vec3(p.x,p.y,0.0);
  pos += vec3(c_offset,-tower_height - b_delta_height);
  pos = pos * rotateAroundZ(deg2rad(proj_yaw));
  return Projector_construct(
    proj_fov,
    proj_aspect_ratio,
    pos,
    -proj_yaw+c_delta_yaw - yaw,
    c_delta_pitch + pitch_angle,
    c_roll);
}

