#ifdef GL_ES
precision mediump float;
#endif

#include "fisheye.h"

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

vec3 dc;

float map(vec3 p)
{
    const int MAX_ITER = 3;
    const float BAILOUT=4.0;
    float Power= sin(time*0.1)*3.0+5.0+0.01*time;

    vec3 v = p;
    vec3 c = v;

    float r=0.0;
    float d=1.0;
    for(int n=0; n<=MAX_ITER; ++n)
    {
        r = length(v);
        if(r>BAILOUT) break;

        float theta = acos(v.z/r);
        float phi = atan(v.y, v.x);
        d = abs(pow(r,Power-1.0)*Power*d)+1.0;

        float zr = abs(pow(r,Power))-0.01*time;
        theta = abs(theta*Power);
        phi = abs(phi*Power);
        v = (vec3(sin(theta)*cos(phi), sin(phi)*sin(theta), cos(theta))*abs(zr))-c*(sin(time)+2.0);
    }
    dc = cos(atan(p-v))*.15;
    return 0.5*log(r)*r/d;
}

void main( void )
{
    vec2 pos = (gl_FragCoord.xy*2.0 - resolution.xy) / resolution.y;
    vec3 camPos = vec3(cos(time*0.1), sin(time*0.1), 1.0);
    vec3 camTarget = vec3(0., 0., 0.);

    vec3 camDir = normalize(camTarget-camPos);
    vec3 camUp  = normalize(vec3(1.0, 0.0, 0.0));
    vec3 camSide = cross(camDir, camUp);
    float focus = 1.7+cos(time*.3)*.5;

    //vec3 rayDir = normalize(camSide*pos.x + camUp*pos.y + camDir*focus);
    vec3 rayDir;

    if (fisheye_direction(gl_FragCoord.xy,resolution,0.0,-PI,PI,rayDir) < 0.0)
    {
      gl_FragColor = vec4(0.0,0.0,0.0, 1.0);
      return;
    }

    vec3 ray = camPos;
    float m = 0.0;
    float d = 0.0, total_d = 0.0;
    const int MAX_MARCH = 48;
    const float MAX_DISTANCE = 32.0;
    vec3 tc;
    ray += rayDir;
    for(int i=0; i<MAX_MARCH; ++i) {
	float s = 1.-float(i)/64.;
	d = map(ray);
        total_d += d * s;
        ray += rayDir * d * s;
        m += 1.0;
	tc += dc * s;
        if(d <= 0.001 || tc.x < 0. || tc.y < 0. || tc.z < 0.) { break; }
        if(total_d > MAX_DISTANCE) { total_d = MAX_DISTANCE; break; }
    }

    float c = (total_d)*0.004;
    tc = pow(tc, .5-vec3(c*c));
    tc = tc*tc-c*m-c;
    vec3 h = clamp(tc+(c*m) - 0.3, 0., 1.0) * .5;
    h = h * h + h * h;
    tc = max(tc, h);
    vec4 result = vec4(tc, 1.);
    gl_FragColor = result;
    //sphinx 
}
