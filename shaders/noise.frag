#include "fisheye.h"

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
//varying vec2 surfacePosition;
//vec2 surfacePosition = vec2 (1024.,128.);
#define MAX_ITER 8

vec3 intersect(in vec3 o, in vec3 d, vec3 c, vec3 u, vec3 v)
{
	vec3 q = o - c;
	return vec3(
		dot(cross(u, v), q),
		dot(cross(q, u), d),
		dot(cross(v, q), d)) / dot(cross(v, u), d);
}


void main( void ) {
	vec2 p = gl_FragCoord.xy /resolution*5.0- vec2(15.0);
	vec2 i = p;
	float c = 1.0;
	float inten = .05;
  
  vec3 dir;
  if (fisheye_direction(gl_FragCoord.xy,resolution,0.0,-PI,PI,dir) < 0.0)
	{
    gl_FragColor = vec4(0.0,0.0,0.0, 1.0);
    return;
  }



	for (int n = 0; n < MAX_ITER; n++) 
	{
		float t = time * (0.4 - (1.0 / float(n+1)));
		i = p + vec2(cos(t - i.x), sin(t - i.y) + cos(t + i.x));
		c += 1.0/length(vec2(p.x / (2.*sin(i.x+t)/inten),p.y / (cos(i.y+t)/inten)));
	}
	c /= float(MAX_ITER);
	c = 1.5-sqrt(pow(c,3.+mouse.x*0.5));
	gl_FragColor = vec4(vec3(0.11*c*c, 0.898*c*c, 0.945*c*c), 1.0);
}
