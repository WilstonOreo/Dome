#include "util.h"

struct Ellipsoid
{
  vec3 radii;
  vec3 center;
};

vec3 pointOnEllipsoid(in vec3 r, vec3 center, in vec2 texCoord)
{
  float 
    theta = (texCoord.t) * PI,
    phi = (texCoord.s - 0.5)* 2.0 * PI;

  return vec3(
    r.x * sin(theta) * sin(phi), 
    r.y * sin(theta) * cos(phi), 
    r.z * cos(theta)) + center;
}

vec2 ellipsoidTexCoords(in vec3 radius, in vec3 center, in vec3 iPoint)
{
  vec3 normal = iPoint - center;
  normal.x /= radius.x;
  normal.y /= radius.y;
  normal.z /= radius.z;
  normal = normalize(normal);
  float s = 1.0 - fract(atan(normal.x,-normal.y) / (2.0*PI) - 0.5);
  float t = 1.0 - fract(acos(normal.z) / PI);
  return vec2(s,t);  
}

struct SqueezedSphere 
{
  float radius;
  float z_radius;
  vec3 center;
};

vec3 SqueezedSphere_point(in SqueezedSphere sphere, in vec2 texCoord)
{
  return pointOnEllipsoid(vec3(sphere.radius,sphere.radius,sphere.z_radius),sphere.center,texCoord);
}

float SqueezedSphere_intersection(
    in SqueezedSphere sphere,
    in Ray ray,
    out vec3 iPoint)
{
  vec3 o = ray.org - sphere.center;
  float invRadius = 1.0 / sphere.radius;
  float invZRadius = 1.0 / sphere.z_radius;
  vec3 o_T = vec3(o.x * invRadius,o.y * invRadius,o.z * invZRadius);
  vec3 d_T = vec3(ray.dir.x * invRadius,ray.dir.y * invRadius,ray.dir.z * invZRadius);

  float a = dot(d_T,d_T);
  float b = 2.0 * dot(d_T,o_T);
  float c = dot(o_T,o_T) - 1.0;
  float t = solveQuadraticEquation(a,b,c);

  if (t < sphere.radius / 1000.0) return -1.0;

  iPoint = ray.org + t * ray.dir;
  return 1.0;
}

struct Sphere
{
  float radius;
  vec3 center;
};

vec3 pointOnSphere(in float r, vec3 center, in vec2 texCoord)
{
  return pointOnEllipsoid(vec3(r,r,r),center,texCoord);
}

vec3 pointOnCenteredSphere(in float r, in vec2 texCoord)
{
  float theta = (texCoord.t) * PI,
        phi = (texCoord.s - 0.5)* 2.0 * PI;
  return r * vec3(
      sin(theta) * sin(phi), 
      sin(theta) * cos(phi), 
      cos(theta));
}

/// Calculate texture coordinates by a point of a sphere defined by radius and center
vec2 sphereTexCoords(in float r, in vec3 center,in vec3 iPoint)
{
  return ellipsoidTexCoords(vec3(r,r,r),center,iPoint);
}

/// Calculate texture coordinates by a point of a sphere defined by radius and center
vec2 squeezedSphereTexCoords(in float r, in float rz, in vec3 center, in vec3 iPoint)
{
  vec3 normal = iPoint - center;
  normal.z /= rz;
  normal.z *= r;
  normal = normalize(normal);
  float s = 1.0 - fract(atan(normal.x,-normal.y) / (2.0*PI) - 0.5);
  float t = 1.0 - fract(acos(normal.z) / PI);
  return vec2(s,t);  
}

/// Calculate texture coordinates by a point of a sphere defined by radius and center
vec2 centeredSphereTexCoords(in float r, in vec3 iPoint)
{
  vec3 normal = normalize(iPoint);
  float s = 1.0 - fract(atan(normal.x,-normal.y) / (2.0*PI) - 0.5);
  float t = 1.0 - fract(acos(normal.z) / PI);
  return vec2(s,t);  
}

vec2 centeredSphereFisheyeTexCoords(in vec3 iPoint, float yaw, float top, float bottom)
{
  vec3 normal = normalize(iPoint);
  float r = (normal.z + top) / (bottom - top) + 1.0;
  if ((r > 1.0) || (r < 0.0)) return vec2(-1.0,-1.0);

  float theta = atan(normal.x,normal.y) + deg2rad(yaw);
  float s = 0.5 * (1.0 + r * sin(theta));
  float t = 0.5 * (1.0 + r * cos(theta));
  return vec2(s,t);  
}

vec2 sphereFisheyeTexCoords(in vec3 center, in vec3 iPoint, float yaw, float top, float bottom)
{
  vec3 normal = normalize(iPoint - center);
  float r = (normal.z + top) / (bottom - top) + 1.0;
  if ((r > 1.0) || (r < 0.0)) return vec2(-1.0,-1.0);

  float theta = atan(normal.x,normal.y) + deg2rad(yaw);
  float s = 0.5 * (1.0 + r * sin(theta));
  float t = 0.5 * (1.0 + r * cos(theta));
  return vec2(s,t);  
}




/// Return 1.0 if ray intersects sphere, otherwise -1.0
float sphereIntersection(
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
float centeredSphereIntersection(
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
