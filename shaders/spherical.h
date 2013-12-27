#include "util.h"

float isect_squeezed_sphere(
    in Ray ray,
    in float radius,
    in float z_radius,
    in vec3 center,
    out vec3 iPoint)
{
  vec3 o = ray.org - center;
  float invRadius = 1.0 / radius;
  float invZRadius = 1.0 / z_radius;
  vec3 o_T = vec3(o.x * invRadius,o.y * invRadius,o.z * invZRadius);
  vec3 d_T = vec3(ray.dir.x * invRadius,ray.dir.y * invRadius,ray.dir.z * invZRadius);

  float a = dot(d_T,d_T);
  float b = 2.0 * dot(d_T,o_T);
  float c = dot(o_T,o_T) - 1.0;
  float t = solveQuadraticEquation(a,b,c);
  if (t < radius / 1000.0) return -1.0;

  iPoint = ray.org + t * ray.dir;
  return 1.0;
}


/// Return 1.0 if ray intersects sphere, otherwise -1.0
float isect_sphere(
    in Ray ray,
    in vec3 center, 
    in float radius, 
    out vec3 iPoint)
{
  vec3 o = ray.org - center;
  float a = dot(ray.dir,ray.dir);
  float b = 2.0 * dot(ray.dir,o);
  float c = dot(o,o) - sqr(radius);
  float t = solveQuadraticEquation(a,b,c);
  if (t < radius / 1000.0) return -1.0;

  iPoint = ray.org + t * ray.dir;
  return 1.0;
}

/// Return 1.0 if ray intersects sphere, otherwise -1.0
float isect_sphere(
    in Ray ray,
    in float radius, 
    out vec3 iPoint)
{
  float a = dot(ray.dir,ray.dir);
  float b = 2.0 * dot(ray.dir,ray.org);
  float c = dot(ray.org,ray.org) - sqr(radius);
  float t = solveQuadraticEquation(a,b,c);
  if (t < radius * 0.001) return -1.0;

  iPoint = ray.org + t * ray.dir;
  return 1.0;
}
