//MG - raymarching
//distance function(s) provided by
//http://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm
#ifdef GL_ES
precision mediump float;
#endif

#include "fisheye.h"

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

#define MIN		0.0
#define MAX		30.0
#define DELTA	0.0005
#define ITER	25

float sphere(vec3 p, float r) {
	p = mod(p,2.0)-0.5*2.0;
	return length(p)-r;
}

float sdBox( vec3 p, vec3 b )
{
	p = mod(p,2.0)-0.5*2.0;
	vec3 d = abs(p) - b;
	return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

float castRay(vec3 o,vec3 d) {
	float delta = MAX;
	float t = MIN;
	for (int i = 0;i <= ITER;i += 1) {
		vec3 p = o+d*t;
		delta = sdBox(p,vec3((sin(time*0.3)+2.0)/5.0, (sin(time*0.2)+1.1)/3.0, 0.5));
		t += delta;
		if (t > MAX) {return MAX;}
		if (delta-DELTA <= 0.0) {return float(i);}
	}
	return MAX;
}

void main() {
	vec2 p=(gl_FragCoord.xy/resolution.y)*1.0;
	p.x-=resolution.x/resolution.y*0.5;p.y-=0.5;
	vec3 o = vec3(sin(time/12.0)*2.0,0.0, time*0.5);
  vec3 d;
  if (fisheye_direction(gl_FragCoord.xy,resolution,0.0,time*0.2,time*0.1,d) < 0.0)
  {
    gl_FragColor = vec4(0.0,0.0,0.0, 1.0);
    return;
  }


	//vec3 d = normalize(vec3(p.x,p.y,1.0));
	
	float t = castRay(o,d);
	vec3 rp = o+d*t;
	
	if (t < MAX) {
		t = 1.0-t/float(MAX);
		gl_FragColor = vec4(t,t,t,1.0);
	}
	else {
		gl_FragColor = vec4(0.0,0.0,0.0,1.0);
	}
}
