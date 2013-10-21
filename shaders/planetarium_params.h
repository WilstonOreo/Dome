#include "spherical.h"

/// Those are known, should NOT be changed
uniform float dome_diameter;
uniform float proj_yaw; // Any value allowed
uniform float distance_center_pole; 
uniform float distance_center_equator; 

//// Those need to be measured
/// Planetarium measurements
/// If planetarium is a half sphere, there are equal to planetarium_diameter / 2.0
/// Range from 0.0 to 30.0



uniform float strip_top; // 0.0
uniform float strip_bottom; // 1.0
uniform float proj_mode;

struct Planetarium
{
  float diameter;
  float top;
  float bottom;

  /// Cached
  float _radius;
};

Planetarium Planetarium_construct(
    in float diameter, 
    in float top,
    in float bottom)
{
  Planetarium planetarium;
  planetarium.diameter = diameter; 
  planetarium.top = top;
  planetarium.bottom = bottom;
  planetarium._radius = planetarium.diameter * 0.50005;
  return planetarium;
}

Planetarium Planetarium_construct()
{
  return Planetarium_construct(dome_diameter,strip_top,strip_bottom);
}

float Planetarium_intersection(in Planetarium planetarium, in Ray ray, out vec3 iPoint)
{
  return centeredSphereIntersection(ray,planetarium._radius,iPoint);
}

float Planetarium_texCoords(in Planetarium planetarium, in Ray ray, out vec2 texCoords)
{
  /// Planetarium Radius
  vec3 iPoint;
  float intersection = centeredSphereIntersection(ray,planetarium._radius,iPoint);
  if (intersection < 0.0)
  {
    return -1.0;
  }

  if (proj_mode > 0.0)
  {
    texCoords = centeredSphereFisheyeTexCoords(iPoint,proj_yaw,planetarium.top,planetarium.bottom);
    if ((texCoords.s > 1.0) || (texCoords.s < 0.0)) return -1.0;
    if ((texCoords.t > 1.0) || (texCoords.t < 0.0)) return -1.0;
  }
  else
  {
    texCoords = centeredSphereTexCoords(planetarium._radius,iPoint);
    texCoords.x = fract(texCoords.x + proj_yaw / 360.0);
    texCoords.y = fract(texCoords.y);  
    if (texCoords.y < planetarium.top || texCoords.y > planetarium.bottom)
    {
      return -1.0;
    }
    texCoords.y = (texCoords.y - planetarium.top) / (planetarium.bottom - planetarium.top);
  }
  return 1.0;
}

vec3 Planetarium_point(in Planetarium planetarium, in vec2 texCoord)
{
  return pointOnCenteredSphere(planetarium._radius,texCoord);
}


