#include "spherical.h"

/// Those are known, should NOT be changed
uniform float dome_diameter;
uniform float proj_yaw; // Any value allowed
uniform float proj_mode; // Above 0.0 > fish eye, below < 0.0 spherical projection
//uniform float dome_z_offset;

//// Those need to be measured
/// Dome measurements
/// If dome is a half sphere, there are equal to dome_diameter / 2.0
/// Range from 0.0 to 30.0
uniform float distance_center_pole; 
uniform float distance_center_equator; 
  
uniform float strip_top; // 0.0
uniform float strip_bottom; // 1.0


struct Dome
{
  float diameter;
  float center_equator;
  float center_pole;
  float z_offset;
  float top;
  float bottom;

  /// Cached
  float _radius;
  float _z_radius;
  float _z;
};

Dome Dome_construct(
    in float diameter, 
    in float center_equator, 
    in float center_pole,
    in float top,
    in float bottom)
{
  Dome dome;
  dome.diameter = diameter; 
  dome.center_equator = center_equator;
  dome.center_pole = center_pole;
  dome.top = top;
  dome.bottom = bottom;
//  dome.z_offset = z_offset;
  dome._radius = dome.diameter * 0.5005;
  dome._z = sqrt(abs(sqr(dome.center_equator) - sqr(dome._radius))); 
  dome._z_radius = dome.center_pole - dome._z;
  //dome._z += dome.z_offset; 
  return dome;
}

Dome Dome_construct()
{
  return Dome_construct(dome_diameter,distance_center_equator,distance_center_pole,strip_top,strip_bottom);
}

vec3 Dome_position(in Dome dome)
{
  return vec3(0.0,0.0,-dome._z);//dome_base_offset);
}

SqueezedSphere Dome_sphere(in Dome dome)
{
  SqueezedSphere sphere;
  sphere.radius = dome._radius;
  sphere.z_radius = dome._z_radius;
  sphere.center = Dome_position(dome);
  return sphere;
}

float Dome_intersection(in Dome dome, in Ray ray, out vec3 iPoint)
{
  return SqueezedSphere_intersection(Dome_sphere(dome),ray,iPoint);
}

float Dome_texCoords(in Dome dome, in Ray ray, out vec2 texCoords)
{
  /// Dome Radius
  vec3 iPoint;
  vec3 pos = Dome_position(dome);
  float intersection = Dome_intersection(dome,ray,iPoint);
  if (intersection < 0.0)
  {
    return -1.0;
  }
  if (proj_mode >= 0.0)
  {
    texCoords = sphereFisheyeTexCoords(iPoint,pos,proj_yaw,dome.top,dome.bottom);
    if ((texCoords.s > 1.0) || (texCoords.s < 0.0)) return -1.0;
    if ((texCoords.t > 1.0) || (texCoords.t < 0.0)) return -1.0;
  }
  else
  {
    texCoords = squeezedSphereTexCoords(dome._radius,dome._z_radius,pos,iPoint);
    texCoords.x = fract(texCoords.x + proj_yaw / 360.0);
    texCoords.y = fract(texCoords.y);
    if (texCoords.y < dome.top || texCoords.y > dome.bottom)
    {
      return -1.0;
    }
    texCoords.y = ( texCoords.y - dome.top) / (dome.bottom - dome.top);
  }
  return 1.0;
}

vec3 Dome_point(in Dome dome, in vec2 texCoord)
{
  return SqueezedSphere_point(Dome_sphere(dome),texCoord);
}


