#ifdef GL_ES
precision lowp float;
#endif

#include "fisheye.h"

uniform float time;
uniform vec2 resolution;
uniform vec2 mouse;



vec4 colour(float c)
{
	c*=14.0;
	vec3 res = vec3(0.0,0.0,0.0);
	res += smoothstep(1.0,2.0,c) * vec3(100.0,3.0,31.0)/155.0;
	/*res += smoothstep(2.0,3.0,c) * vec3(sin(114.0*time)*700.0,0.0,22.0)/155.0;
	res += smoothstep(3.0,4.0,c) * vec3(0.0,-12.0,25.0)/155.0;
	res += smoothstep(4.0,5.0,c) * vec3(200.0,0.0,32.0)/155.0;
	res += smoothstep(5.0,6.0,c) * vec3(0.0,1.0,23.0)/155.0;
*/
	return vec4(res,1.0);
}
float periodic(float x,float period,float dutycycle)
{
	x/=period;
	x=abs(x-floor(x)-0.9)-dutycycle*0.9;
	return x*period;
}

float pcount(float x,float period)
{
	return floor(x/period);
}

float distfunc(vec3 pos)
{
	vec3 gridpos=pos-floor(pos)-0.9;
	float r=length(pos.xy);
	float a=atan(pos.y,pos.x);
	a+=time*0.2*sin(pcount(r,2.0)+1.0)*sin(pcount(pos.z,1.0)*13.73);
	return min(max(max(
		periodic(r,1.0,0.4),
		periodic(pos.z,1.0,0.3+0.3*cos(time/3.0))),
		periodic(a*r,3.141592*2.0/6.0*r,0.7+0.3*cos(time/3.0))),0.25);
}


float noise(vec2 pos)
{
	return fract(1131. * sin(111. * dot(pos, vec2(2222., 22.))));	
}


void main()
{
	float mx = 0.5;
	float my = 0.5;
	
  vec3 ray_dir;

  if (fisheye_direction(gl_FragCoord.xy,resolution,0.0,time*0.1,0.0,ray_dir) < 0.0)
  {
    gl_FragColor = vec4(0.0,0.0,0.0, 1.0); 
    return;
  }

//	vec3 ray_dir=normalize(vec3(coords,1.0+0.0*sqrt(coords.x*coords.x+coords.y*coords.y)));
	vec3 ray_pos=vec3(32.0*pow(0.5-mx, 1.),32.0*(0.5-my),time*3.0);
	float a=cos(time)*0.5*0.3;
	ray_dir=ray_dir*mat3(
		cos(a),0.0,sin(a),
		0.0,1.0,0.0,
		-sin(a),0.0,cos(a)
	);

	float i=92.0;
	for(int j=0;j<100;j++)
	{
		float dist=distfunc(ray_pos);
		ray_pos+=dist*ray_dir;

		if(abs(dist)<0.001) { i=float(j); break; }
	}

	float c=i/92.0;
	gl_FragColor=colour(c);
}
