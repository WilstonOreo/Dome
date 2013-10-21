
uniform float proj_fov; // 68.2 is default
uniform float proj_aspect_ratio; // 0.75 is default
uniform float tower_height;
/// Range from -90.0 to 90.0
uniform float pitch_angle;

/// Projector measurements

uniform float a_distance_center;
uniform float b_distance_center;
uniform float c_distance_center;
uniform float d_distance_center;

/// Those should all be zero, if not fine-tuned
/// Range from -1.0 to 1.0
uniform float a_delta_height; 
uniform float b_delta_height;
uniform float c_delta_height;
uniform float d_delta_height;

/// Range from -45.0 to 45.0 deg
uniform float a_delta_pitch;
uniform float b_delta_pitch;
uniform float c_delta_pitch;
uniform float d_delta_pitch;
uniform float a_delta_yaw;
uniform float b_delta_yaw;
uniform float c_delta_yaw;
uniform float d_delta_yaw;

/// Range from -10.0 to 10.0 deg
uniform float a_roll;
uniform float b_roll;
uniform float c_roll;
uniform float d_roll;

/// Range from -3.0 to 3.0 
uniform float a_shift;
uniform float b_shift;
uniform float c_shift;
uniform float d_shift;

uniform float a_alpha;
uniform float b_alpha;
uniform float c_alpha;
uniform float d_alpha;

Projector ProjectorA_construct()
{
  vec3 pos = vec3(a_shift,-a_distance_center,-a_delta_height - tower_height);
  return Projector_construct(
    proj_fov,
    proj_aspect_ratio,
    a_alpha,
    pos,
    a_delta_yaw,
    a_delta_pitch + pitch_angle,
    a_roll);
}


Projector ProjectorB_construct()
{
  vec3 pos = vec3(b_distance_center,b_shift,-b_delta_height - tower_height);
  return Projector_construct(
    proj_fov,
    proj_aspect_ratio,
    b_alpha,
    pos,
    90.0 + b_delta_yaw,
    b_delta_pitch + pitch_angle,
    b_roll);
}

Projector ProjectorC_construct()
{
  vec3 pos = vec3(c_shift,c_distance_center,-c_delta_height - tower_height);
  return Projector_construct(
    proj_fov,
    proj_aspect_ratio,
    c_alpha,
    pos,
    180.0 + c_delta_yaw,
    c_delta_pitch + pitch_angle,
    c_roll);
}

Projector ProjectorD_construct()
{
  vec3 pos = vec3(d_shift,d_distance_center,-d_delta_height - tower_height);
  return Projector_construct(
    proj_fov,
    proj_aspect_ratio,
    d_alpha,
    pos,
    270.0 + d_delta_yaw,
    d_delta_pitch + pitch_angle,
    d_roll);
}

vec2 constructFromCoords(in vec2 coord, out Projector proj)
{
  vec2 outCoord = coord;
  outCoord.x *= 4.0;
  int idx = int(floor(outCoord.x));
/// Projector A
  if (idx == 0)
  {
    proj = ProjectorA_construct();
  } else
/// Projector B
  if (idx == 1)
  {
    proj = ProjectorB_construct();
  } else
/// Projector C
  if (idx == 2)
  {
    proj = ProjectorC_construct();
  } else
  if (idx == 3)
  {
    proj = ProjectorD_construct();
  }

  outCoord.x = 1.0 - fract(outCoord.x);
  return outCoord;
}
