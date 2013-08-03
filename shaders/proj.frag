/// Our texture
uniform sampler2D proj_texture;

/// Dome parameters
uniform float dome_base_offset;
uniform float dome_radius;
uniform float dome_inner_radius;

/// Projector settings
/// Note: Projector position is calculated from dome_inner_radius, 
///       proj_yaw and proj_offset
uniform float proj_yaw;
uniform float proj_pitch;
uniform float proj_tower_height;
uniform vec2 proj_offset; 

uniform float proj_fov; // 120.0 is default
uniform float proj_aspect_ratio; // 0.75 is default

/// Alpha Value (should be 1.0)
uniform float alpha_value;

const float PI = 3.14159265358979323846264;


vec3 interpolate(in float t, in vec3 a, in vec3 b)
{
  return a + t * (b - a);
}

/// Convert degrees to radians
float deg2rad(in float deg)
{
  return deg * PI / 180.0;
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

/// Compute projector position based in dome_inner_radius and proj_yaw
vec3 calcProjPosition()
{
  float theta = deg2rad(proj_yaw);
  float ct = cos(theta), st = sin(theta);
  float radius = dome_inner_radius + proj_offset.y;
  float height = dome_radius - proj_tower_height;
  return  
    vec3(-st*proj_offset.x,ct*proj_offset.x,0.0) + 
    vec3(ct*radius,st*radius,height);
}

/// Calculate rotation by given yaw and pitch angles (in degrees!)
mat3 rotationMatrix(in float yaw, in float pitch)
{
  return rotateAroundZ(deg2rad(yaw)) * 
         rotateAroundY(deg2rad(180.0 - pitch));
}

/// Calculate point on projector screen by given screen coordinates
vec3 pointOnScreen(in vec2 screenCoord)
{
  float a = proj_fov / 2.0;
  float width = tan(deg2rad(a));
  float height = width * proj_aspect_ratio;

  mat3 M = rotationMatrix(proj_yaw,proj_pitch);
  vec3 topLeft = M * vec3(1.0,-width,height);
  vec3 topRight = M * vec3(1.0,width,height);
  vec3 bottomLeft = M * vec3(1.0,-width,-height);
  vec3 bottomRight = M * vec3(1.0,width,-height);

  return interpolate(screenCoord.y,
                     interpolate(screenCoord.x,topLeft,topRight),
                     interpolate(screenCoord.x,bottomLeft,bottomRight));
}

/// Return 1.0 if ray intersects sphere, otherwise -1.0
float sphereIntersection(in vec3 rayorg, in vec3 raydir, in vec3 center, in float radius, out vec3 iPoint)
{
  vec3 o = rayorg - center;
  float a = dot(raydir,raydir);
  float b = 2.0 * dot(raydir,o);
  float c = dot(o,o) - radius * radius;

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
  if (t < radius / 1000.0) return -1.0;

  iPoint = rayorg + t * raydir;
  return 1.0;
}

/// Calculate texture coordinates by a point of a sphere defined by radius and center
vec2 sphereTexCoords(in vec3 center, in float radius, in vec3 iPoint)
{
  vec3 normal = normalize(iPoint - center);
  float s = fract(atan(normal.x,normal.y) / (2.0*PI) + 0.5);
  float t = fract(acos(normal.z) / PI);
  return vec2(s,t);  
}

/// Our projection function!
vec2 transformToDome(in vec2 texCoord)
{
  vec3 raydir = normalize(pointOnScreen(texCoord));
  vec3 proj_pos = calcProjPosition();
  vec3 iPoint;
  vec3 rayorg = vec3(proj_pos.x,-proj_pos.y,-proj_pos.z);

  vec3 dome_position = vec3(0.0,0.0,dome_base_offset);

  float theta = deg2rad(proj_yaw);
  float intersection = sphereIntersection(rayorg,raydir,dome_position,dome_radius*1.001,iPoint);
  if (intersection < 0.0)
  {
    return sphereTexCoords(dome_position,dome_radius,rayorg);
  }
  return sphereTexCoords(dome_position,dome_radius,iPoint);
}


void main()
{
  gl_FragColor = texture2D(proj_texture, transformToDome(gl_TexCoord[0].st));
  gl_FragColor.a = alpha_value;
}

// Setting Each Pixel To Red
// gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
