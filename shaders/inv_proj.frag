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

/// Our texture
uniform sampler2D proj_texture;

/// Dome parameters
uniform float dome_base_offset;
uniform float dome_radius;
uniform float dome_inner_radius;

/// Must be the same for all projectors
uniform float proj_fov; // 120.0 is default
uniform float proj_aspect_ratio; // 0.75 is default

/// Projector settings
/// Note: Projector position is calculated from dome_inner_radius, 
///       proj_yaw and proj_offset
uniform float proj_a_yaw;
uniform float proj_a_pitch;
uniform float proj_a_tower_height;
uniform vec2 proj_a_offset; 

uniform float proj_b_yaw;
uniform float proj_b_pitch;
uniform float proj_b_tower_height;
uniform vec2 proj_b_offset; 

uniform float proj_c_yaw;
uniform float proj_c_pitch;
uniform float proj_c_tower_height;
uniform vec2 proj_c_offset; 

uniform vec4 proj_multi;

const float PI = 3.14159265358979323846264;

/// Convert degrees to radians
float deg2rad(in float deg)
{
  return deg * PI / 180.0;
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
vec3 calcProjPosition(in float yaw, in float tower_height, in vec2 offset)
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

float projIntersection(in vec3 point, 
  in float yaw, 
  in float pitch, 
  in float tower_height, 
  in vec2 offset)
{
  vec3 proj_pos = calcProjPosition(yaw,tower_height,offset);
  mat3 proj_matrix = projMatrix(yaw,pitch);

  float d_frustum = frustumIntersection(point,proj_pos,proj_matrix);
  
  return (d_frustum >= 0.0) ? 1.0 : 0.0;
/*
  float d = - d_frustum / 0.05;
  return  min(max(d,0.0),1.0);*/
}

vec3 pointOnSphere(in vec2 texCoord)
{
  float r = dome_radius, 
    theta = (texCoord.t) * PI,
    phi = (texCoord.s - 0.5)* 2.0 * PI;

  return vec3(
    r * sin(theta) * sin(phi), 
    r * sin(theta) * cos(phi), 
    r * cos(theta) + dome_base_offset);
}


void main()
{
  //gl_FragColor = vec4(0.0,0.0,0.0,0.0);

  if (proj_multi.w > 0.0)
  {
    gl_FragColor = texture2D(proj_texture,gl_TexCoord[0].st);
    gl_FragColor.a = 0.5;
  } else
  {
    gl_FragColor = vec4(0.0,0.0,0.0,0.5);
  }
  
  vec3 point = pointOnSphere(gl_TexCoord[0].st);
  
  float a_intersect = projIntersection(point,
    proj_a_yaw,proj_a_pitch,proj_a_tower_height,proj_a_offset);
  float b_intersect = projIntersection(point,
    proj_b_yaw,proj_b_pitch,proj_b_tower_height,proj_b_offset);
  float c_intersect =projIntersection(point,
    proj_c_yaw,proj_c_pitch,proj_c_tower_height,proj_c_offset);
  
  gl_FragColor.r += proj_multi.x * a_intersect;
  gl_FragColor.g += proj_multi.y * b_intersect;
  gl_FragColor.b += proj_multi.z * c_intersect;
  gl_FragColor.a += a_intersect / 6.0;
  gl_FragColor.a += b_intersect / 6.0;
  gl_FragColor.a += c_intersect / 6.0;
}

