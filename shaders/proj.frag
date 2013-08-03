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

/// Settings from left and right projector (required for edge blending)
uniform float left_proj_yaw;
uniform float left_proj_pitch;
uniform float left_proj_tower_height;
uniform vec2 left_proj_offset; 
uniform float right_proj_yaw;
uniform float right_proj_pitch;
uniform float right_proj_tower_height;
uniform vec2 right_proj_offset; 


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

/// Compute projector position based in dome_inner_radius and
/// proj_yaw, proj_offset and proj_tower_height
vec3 calcProjPosition(
  in float yaw, // projector's yaw angle 
  in vec2 offset, // projector's xy offset vector
  in float tower_height // projector's tower height (Z offset)
  )
{
  float theta = deg2rad(yaw);
  float ct = cos(theta), st = sin(theta);
  float radius = dome_inner_radius + offset.y;
  float height = dome_radius - tower_height;
  return
    vec3(1.0,-1.0,-1.0) * (
    vec3(-st*offset.x,ct*offset.x,0.0) + 
    vec3(ct*radius,st*radius,height));
}

/// Calculate rotation by given yaw and pitch angles (in degrees!)
mat3 projMatrix(in float yaw, in float pitch)
{
  return rotateAroundZ(deg2rad(yaw)) * 
         rotateAroundY(deg2rad(180.0 - pitch));
}

/// Calculates projectors frustum described by four corner vectors
void projFrustum(
  in mat3 proj_matrix, // projection matrix 
  out vec3 top_left, 
  out vec3 top_right,
  out vec3 bottom_left,
  out vec3 bottom_right)
{
  float a = proj_fov / 2.0;
  float width = tan(deg2rad(a));
  float height = width * proj_aspect_ratio;
  top_left = proj_matrix * vec3(1.0,-width,height);
  top_right = proj_matrix * vec3(1.0,width,height);
  bottom_left = proj_matrix * vec3(1.0,-width,-height);
  bottom_right = proj_matrix * vec3(1.0,width,-height);
}

void projCoordinateSystem(
  in mat3 proj_matrix, // projection matrix 
  out vec3 look_at,
  out vec3 side,
  out vec3 up)
{
  look_at = proj_matrix * vec3(1.0,0.0,0.0);
  side = proj_matrix * vec3(0.0,1.0,0.0);
  up = proj_matrix * vec3(0.0,0.0,1.0);
}

/// Tests if a point intersects frustum. Returns minimum distance from point to frustum
/// If distance > 0, there is an intersection
float frustumIntersection(
  in vec3 point, 
  in vec3 pos,
  in mat3 proj_matrix)
{

  vec3 top_left, top_right, bottom_left, bottom_right;
  projFrustum(proj_matrix,top_left,top_right,bottom_left,bottom_right);
  vec3 look_at, side, up;
  projCoordinateSystem(proj_matrix,look_at,side,up);
  
  vec3 o = point - pos;
  vec3 n_top = -normalize(cross(top_left,top_right)); // Top normal
  vec3 n_bottom = normalize(cross(bottom_left,bottom_right)); // Bottom normal
  vec3 n_left = normalize(cross(top_left,bottom_left)); // Left normal
  vec3 n_right = -normalize(cross(top_right,bottom_right)); // Right normal

  float d = dot(o,look_at);
  float d_top = dot(o,n_top);
  float d_bottom = dot(o,n_bottom);
  float d_left = dot(o,n_left);
  float d_right = dot(o,n_right);
  if (d < 0.0) return -100000000.0;

//  return min(d_left,d_right);

  return min(min(d_top,d_bottom),min(d_left,d_right));
}

/// Calculate point on projector screen by given screen coordinates
vec3 pointOnScreen(in vec2 screenCoord)
{
  float a = proj_fov / 2.0;
  float width = tan(deg2rad(a));
  float height = width * proj_aspect_ratio;

  mat3 M = projMatrix(proj_yaw,proj_pitch);
  vec3 top_left, top_right, bottom_left, bottom_right;
  projFrustum(M,
    top_left,
    top_right,
    bottom_left,
    bottom_right);
  return interpolate(screenCoord.y,
                     interpolate(screenCoord.x,top_left,top_right),
                     interpolate(screenCoord.x,bottom_left,bottom_right));
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
vec2 transformToDome(in vec2 texCoord, out vec3 iPoint)
{
  vec3 raydir = normalize(pointOnScreen(texCoord));
  vec3 proj_pos = calcProjPosition(proj_yaw,proj_offset,proj_tower_height);

  vec3 dome_position = vec3(0.0,0.0,dome_base_offset);

  float theta = deg2rad(proj_yaw);
  float intersection = sphereIntersection(proj_pos,raydir,dome_position,dome_radius,iPoint);
  if (intersection < 0.0) iPoint = proj_pos;
  return sphereTexCoords(dome_position,dome_radius,iPoint);
}

float edgeblend(
  in vec3 iPoint,
  float yaw, float pitch,
  float tower_height, vec2 offset)
{
  mat3 M = projMatrix(yaw,pitch);
  vec3 top_left, top_right, bottom_left, bottom_right;
  vec3 proj_pos = calcProjPosition(yaw,offset,tower_height);  
  return frustumIntersection(iPoint,proj_pos,M);
}



void main()
{
  vec3 iPoint;
  gl_FragColor = texture2D(proj_texture, transformToDome(gl_TexCoord[0].st,iPoint));

  float left_edgeblend = edgeblend(iPoint,left_proj_yaw,left_proj_pitch,left_proj_tower_height,left_proj_offset);
  float right_edgeblend = edgeblend(iPoint,right_proj_yaw,right_proj_pitch,right_proj_tower_height,right_proj_offset);
  gl_FragColor.a = alpha_value;
  
  if (left_edgeblend >= 0.0)
  {
    gl_FragColor.a *= 0.25;
    if (right_edgeblend >= 0.0)
    {
      gl_FragColor.a *= 0.25;
    }
  }

}

