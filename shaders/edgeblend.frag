/******************************************************************
    This file is part of DomeSimulator.

    DomeSimulator is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    DomeSimulator is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with DomeSimulator.  If not, see <http://www.gnu.org/licenses/>.

    DomeSimulator is free for non-commercial use. If you want to use it 
    commercially, you should contact the author 
    Michael Winkelmann aka Wilston Oreo by mail:
    me@wilstonoreo.net
**************************************************************************/

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
uniform float overlap_proj_yaw;
uniform float overlap_proj_pitch;
uniform float overlap_proj_tower_height;
uniform vec2 overlap_proj_offset; 

uniform float edge_blur; // 0.05

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
  /// Normals of frustum required for calculating intersection
  vec3 n_top = -normalize(cross(top_left,top_right)); // Top normal
  vec3 n_bottom = normalize(cross(bottom_left,bottom_right)); // Bottom normal
  vec3 n_left = normalize(cross(top_left,bottom_left)); // Left normal
  vec3 n_right = -normalize(cross(top_right,bottom_right)); // Right normal

  /// Distances to frustum planes
  float d = dot(o,look_at);
  float d_top = dot(o,n_top);
  float d_bottom = dot(o,n_bottom);
  float d_left = dot(o,n_left);
  float d_right = dot(o,n_right);
  if (d < 0.0) return -100000000.0;

  /// Return minimum distance
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


/// Edge blend if theres is a frustum intersection
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

/// Calculate intersection point between projector screen ray and dome
float getIntersectionPoint(in vec2 texCoord, out vec3 iPoint)
{
  vec3 raydir = pointOnScreen(texCoord);
  vec3 proj_pos = calcProjPosition(proj_yaw,proj_offset,proj_tower_height);

  vec3 dome_position = vec3(0.0,0.0,dome_base_offset);

  float theta = deg2rad(proj_yaw);
  return sphereIntersection(proj_pos,raydir,dome_position,dome_radius,iPoint);
}

void main()
{
  vec3 iPoint;
  float intersection = getIntersectionPoint(gl_TexCoord[0].st,iPoint);

  if (intersection < 0.0)
  {
    gl_FragColor = vec4(0.0,0.0,0.0,1.0);
    return;
  }

  gl_FragColor = vec4(1.0,1.0,1.0,1.0);
  float edgeblend = edgeblend(iPoint,
    overlap_proj_yaw,
    overlap_proj_pitch,
    overlap_proj_tower_height,
    overlap_proj_offset);
  float le = -edgeblend / edge_blur;
  gl_FragColor *= max(min(le,1.0),0.0);

  gl_FragColor.a = 1.0;
}

