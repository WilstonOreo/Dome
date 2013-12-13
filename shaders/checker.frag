#version 120
#include "spherical.h"

uniform sampler2D white_tex;
uniform vec2 white_scale;
uniform sampler2D black_tex;
uniform vec2 black_scale;

uniform vec3 eye;
uniform vec2 checker_offset;
uniform vec2 checker_scale;
uniform float plane_height;
uniform vec3 sphere_center;
uniform float sphere_radius;

vec4 checkerBoard(float t, vec2 pos)
{
  float dir = (t < 0.0) ? 1.0 : -1.0;
  vec2 tPos = checker_scale*pos + dir*checker_offset;
  int checker = 0;
  if ((mod(abs(tPos.x),2.0) > 1.0) && (mod(abs(tPos.y),2.0) > 1.0) ||
      (mod(abs(tPos.x),2.0) < 1.0) && (mod(abs(tPos.y),2.0) < 1.0)) checker = 1;
  float dist = length(pos - eye.xy)*2.0 / 50.0;
  if (dist < 0.0) dist = 0.0;

  vec4 color;
  if (checker == 1)
  {
    color = vec4(1.0,1.0,1.0,1.0);// texture2D(white_tex, tPos * white_scale); 
  } else
  {
    color = vec4(0.0,0.0,0.0,1.0);//texture2D(black_tex, tPos * black_scale); 
  }

  return (1.0 - dist)*color;
}


float planeIntersection(in Ray ray, in float pos)
{
  return -(pos-ray.org.z)/(ray.dir.z);
}

float planeIntersection(in Ray ray)
{
  return planeIntersection(ray,plane_height);
}

float solveQuadraticEquation(
  in float a,
  in float b,
  in float c,
  out float t0,
  out float t1)
{
  float disc = b*b - 4.0 * a * c;
  if (disc < 0.0) return -1.0;

  float distSqrt = sqrt(disc);
  float q;
  if (b < 0.0)
  {
    q = (-b - distSqrt)*0.5;
  }
  else
  {
    q = (-b + distSqrt)*0.5;
  }
  if (q == 0.0) return -1.0;

  t0 = c / q;
  t1 = q / a;
  return 1.0;
}


float sphereIntersect(
  in Ray ray,
  in vec3 center,
  in float radius)
{
  vec3 o = ray.org - center;
  float a = dot(ray.dir,ray.dir);
  float b = 2.0 * dot(ray.dir,o);
  float c = dot(o,o) - sqr(radius);
  float t = -10000.0, t0, t1;

  if (solveQuadraticEquation(a,b,c,t0,t1) < 0.0) return t;

  if (t0 > t1)
  {
    float temp = t0;
    t0 = t1;
    t1 = temp;
  }

  if (t1 < 0.0) return t;
  if (t0 < 0.0)
  {
    t = t1;
  }
  else
  {
    t = t0;
  }
  return t;
}


void main()
{
  vec2 coord = gl_TexCoord[0].xy;
  coord.y = 1.0 - coord.y;

  Ray ray;
  ray.org = eye;
  ray.dir = normalize(pointOnSphere(1.0,vec3(0.0,0.0,0.0),vec2(coord.x, coord.y)));

  vec3 iPoint;
  float s = sphereIntersect(ray,sphere_center,sphere_radius);
  float t = planeIntersection(ray);
  vec4 v = vec4(1.0,1.0,1.0,1.0);

  if (s < 0.0)
  {
    iPoint = ray.org + t*ray.dir;
    v = checkerBoard(t,iPoint.xy);
  }
  else
  {
    iPoint = ray.org + s*ray.dir;
    ray.dir = reflect(normalize(ray.dir),normalize(iPoint - sphere_center));
    ray.org = iPoint;
    t = max(planeIntersection(ray,plane_height),planeIntersection(ray,-plane_height));
    if (t > 0)
    {
      iPoint = ray.org + t*ray.dir;
      v = checkerBoard(t,iPoint.xy);
    }
  }

  gl_FragColor = v;
}
