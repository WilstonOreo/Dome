#include "util.h"

struct Projector
{
  float fov;
  float aspect_ratio;
  vec3 offset;
  mat3 matrix;
};

Projector Projector_construct(
    float fov,
    float aspect_ratio,
    vec3 offset,
    float yaw,
    float pitch,
    float roll)
{
  Projector proj;
  proj.fov = fov;
  proj.aspect_ratio = aspect_ratio;
  proj.offset = offset;
  proj.matrix = rotationMatrix(yaw,pitch,roll);
  return proj;
}

void Projector_coordinateSystem(
  in Projector proj,
  out vec3 look_at,
  out vec3 side,
  out vec3 up)
{
  look_at = proj.matrix * vec3(1.0,0.0,0.0);
  side = proj.matrix * vec3(0.0,1.0,0.0);
  up = proj.matrix * vec3(0.0,0.0,1.0);
}

struct Frustum
{
  vec3 eye;
  vec3 look_at;
  vec3 top_left; 
  vec3 top_right;
  vec3 bottom_left;
  vec3 bottom_right;
};

Frustum Frustum_construct(in Projector proj)
{
  Frustum frustum;
  float a = proj.fov / 2.0;
  float width = tan(deg2rad(a));
  float height = width * proj.aspect_ratio;
  frustum.eye = proj.offset;
  frustum.top_left = proj.matrix * vec3(1.0,-width,height);
  frustum.top_right = proj.matrix * vec3(1.0,width,height);
  frustum.bottom_left = proj.matrix * vec3(1.0,-width,-height);
  frustum.bottom_right = proj.matrix * vec3(1.0,width,-height);
  frustum.look_at = proj.matrix * vec3(1.0,0.0,0.0);
  return frustum;
}

Frustum Frustum_construct(in Projector proj, 
    float squeezeLeft, 
    float squeezeRight, 
    float squeezeTop, 
    float squeezeBottom) 
{
  Frustum frustum;
  float a = proj.fov / 2.0;
  float width = tan(deg2rad(a));
  float height = width * proj.aspect_ratio;
  frustum.eye = proj.offset;
  frustum.top_left = proj.matrix * vec3(1.0,-width + squeezeLeft,height - squeezeBottom);
  frustum.top_right = proj.matrix * vec3(1.0,width - squeezeRight,height - squeezeBottom);
  frustum.bottom_left = proj.matrix * vec3(1.0,-width + squeezeLeft,-height + squeezeTop);
  frustum.bottom_right = proj.matrix * vec3(1.0,width - squeezeRight,-height + squeezeTop);
  frustum.look_at = proj.matrix * vec3(1.0,0.0,0.0);
  return frustum;
}

/// Tests if a point intersects frustum. Returns minimum distance from point to frustum
/// If distance > 0, there is an intersection
float Frustum_intersection(in Frustum frustum, in vec3 point, float offset)
{
  vec3 o = point - frustum.eye;
  /// Normals of frustum required for calculating intersection
  vec3 n_top = -normalize(cross(frustum.top_left,frustum.top_right)); // Top normal
  vec3 n_bottom = normalize(cross(frustum.bottom_left,frustum.bottom_right)); // Bottom normal
  vec3 n_left = normalize(cross(frustum.top_left,frustum.bottom_left)); // Left normal
  vec3 n_right = -normalize(cross(frustum.top_right,frustum.bottom_right)); // Right normal

  /// Distances to frustum planes
  float d = dot(o,frustum.look_at); 
  float d_top = dot(o,n_top); 
  float d_bottom = dot(o,n_bottom);
  float d_left = dot(o,n_left);
  float d_right = dot(o,n_right);
  
  if (d < offset) return -100000000.0;
  if ((d_top < offset) && (d_bottom < offset) && (d_left < offset) && (d_right < offset))
  {
    return -1000000.0; // min(min(-d_top,-d_bottom),min(-d_left,-d_right));
  } 

  /// Return minimum distance
  return min(min(d_top,d_bottom),min(d_left,d_right));
}

float Frustum_intersection(in Frustum frustum, in vec3 point)
{
  return Frustum_intersection(frustum,point,0.0);
}

/// Calculate point on projector screen by given screen coordinates
vec3 Frustum_pointOnScreen(in Frustum frustum, in vec2 screenCoord)
{
  return mix(mix(frustum.top_left,frustum.top_right,screenCoord.x),
             mix(frustum.bottom_left,frustum.bottom_right,screenCoord.x),screenCoord.y);
}

Ray Frustum_ray(in Frustum frustum, in vec2 screenCoord)
{
  Ray ray;
  ray.org = frustum.eye; 
  ray.dir = Frustum_pointOnScreen(frustum,screenCoord);
  return ray;
}

