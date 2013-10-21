
const float PI = 3.14159265358979323846264;

const vec4 Color_Black = vec4(0.0,0.0,0.0,1.0);
const vec4 Color_White = vec4(1.0,1.0,1.0,1.0);
const vec4 Color_None = vec4(0.0,0.0,0.0,0.0);

struct Ray
{
  vec3 org;
  vec3 dir;
};

vec3 interpolate(in float t, in vec3 a, in vec3 b)
{
  return a + t * (b - a);
}

/// Convert degrees to radians
float deg2rad(in float deg)
{
  return deg * PI / 180.0;
}

/// Convert degrees to radians
float rad2deg(in float rad)
{
  return rad / PI * 180.0;
}

float sqr(in float a)
{
  return a*a;
}

/// Calculates the rotation matrix of a rotation around X axis with an angle in radians
mat3 rotateAroundX( in float angle )
{
  float s = sin(angle);
  float c = cos(angle);
  return mat3(1.0,0.0,0.0,
              0.0,  c, -s,
              0.0,  s,  c);
}

/// Calculates the rotation matrix of a rotation around Y axis with an angle in radians
mat3 rotateAroundY( in float angle )
{
  float s = sin(angle);
  float c = cos(angle);
  return mat3(  c,0.0,  s,
              0.0,1.0,0.0,
               -s,0.0,  c);
}

/// Calculates the rotation matrix of a rotation around Z axis with an angle in radians
mat3 rotateAroundZ( in float angle )
{
  float s = sin(angle);
  float c = cos(angle);
  return mat3(  c, -s,0.0,
                s,  c,0.0,
              0.0,0.0,1.0);
}

/// Calculate rotation by given yaw and pitch angles (in degrees!)
mat3 rotationMatrix(in float yaw, in float pitch, in float roll)
{
  return rotateAroundZ(deg2rad(yaw)) * 
         rotateAroundY(deg2rad(-pitch)) * 
         rotateAroundX(deg2rad(roll));
}

float intersectionPointsOfCircles(
    in float a, 
    in float b, 
    in float c, 
    in float d, 
    in float r0, 
    in float r1,
    out vec2 first,
    out vec2 second)
{
  float det = sqr(c-a) + sqr(d-b);
  if (det < 0.0) return -1.0;
  float D = sqrt(det);
  float detR = (D + r0 + r1) * (D + r0 - r1) * (D - r0 + r1) * (-D + r0 +r1);
  if (detR < 0.0) return -1.0;

  float delta = 0.25 * sqrt(detR);
  float rDiff = (sqr(r0) - sqr(r1));
  float xTerm1 = 0.5 * (a + c + (c - a) * rDiff / det); 
  float xTerm2 = 2.0 * (b - d) / det * delta;
  float yTerm1 = 0.5 *(b + d + (d - b) * rDiff / det); 
  float yTerm2 = 2.0 * (a - c) / det * delta;

  first = vec2(xTerm1+xTerm2,yTerm1-yTerm2);
  second = vec2(xTerm1-xTerm2,yTerm1+yTerm2);
  return 1.0;
}

float intersectionPointsOfCircles(
    in vec2 pos0, 
    in float r0,
    in vec2 pos1,
    in float r1,
    out vec2 first,
    out vec2 second)
{
  return intersectionPointsOfCircles(pos0.x,pos0.y,pos1.x,pos1.y,r0,r1,first,second);
}


float solveQuadraticEquation(
    in float a,
    in float b,
    in float c)
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

  float t = c / q;
  if (t < 0.0) 
    t = q / a;

  return t;
}

