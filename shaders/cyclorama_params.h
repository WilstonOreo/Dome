#include "cylindrical.h"

/// Those are known, should NOT be changed
uniform float cyclorama_diameter;
uniform float cyclorama_height;
uniform float cyclorama_z_offset;

struct Cyclorama
{
  float diameter;
  float height;
  float z_offset;

  /// Cached
  float _radius;
};

Cyclorama Cyclorama_construct(in float diameter, in float height, in float z_offset)
{
  Cyclorama cyclorama;
  cyclorama.diameter = diameter; 
  cyclorama.height = height;
  cyclorama.z_offset = z_offset;
  cyclorama._radius = cyclorama.diameter / 2.0 * 1.001;
  return cyclorama;
}

Cyclorama Cyclorama_construct()
{
  return Cyclorama_construct(cyclorama_diameter,cyclorama_height,cyclorama_z_offset);
}

vec3 Cyclorama_position(in Cyclorama cyclorama)
{
  return vec3(0.0,0.0,-cyclorama.z_offset);
}

Cylinder Cyclorama_cylinder(in Cyclorama cyclorama)
{
  Cylinder cylinder;
  cylinder.radius = cyclorama._radius;
  cylinder.height = cyclorama.height;
  cylinder.center = Cyclorama_position(cyclorama);
  return cylinder;
}

float Cyclorama_intersection(in Cyclorama cyclorama, in Ray ray, out vec3 iPoint)
{
  return Cylinder_intersection(Cyclorama_cylinder(cyclorama),ray,iPoint);
}

float Cyclorama_texCoords(in Cyclorama cyclorama, in Ray ray, out vec2 texCoord)
{
  /// Cyclorama Radius
  vec3 iPoint;
  vec3 pos = Cyclorama_position(cyclorama);
  float intersection = Cyclorama_intersection(cyclorama,ray,iPoint);
  if (intersection < 0.0)
  {
    return -1.0;
  }
  texCoord = Cylinder_texCoords(Cyclorama_cylinder(cyclorama),iPoint);
  return 1.0;
}

vec3 Cyclorama_point(in Cyclorama cyclorama, in vec2 texCoord)
{
  return Cylinder_point(Cyclorama_cylinder(cyclorama),texCoord);
}


