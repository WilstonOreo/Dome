// Tile Waves
// 
// Another quick raymarching for fun :)
//
// by @paulofalcao
//


#ifdef GL_ES
precision highp float;
#endif


uniform vec2 resolution;
uniform float time;
uniform vec2 mouse;
uniform sampler2D texture;

uniform vec3 cameraAngles;
uniform vec3 cameraPosition;

#include "fisheye.h"

//******************
// Scene Start
//******************
vec2 sim2d(vec2 p,float s){
   vec2 ret=p;
   ret=p+s/2.0;
   ret=fract(ret/s)*s-s/2.0;
   return ret;
}

vec3 stepspace(vec3 p,float s){
  return p-mod(p-s/2.0,s);
}

vec2 rot(vec2 p,float r){
   vec2 ret;
   ret.x=p.x*cos(r)-p.y*sin(r);
   ret.y=p.x*sin(r)+p.y*cos(r);
   return ret;
}

vec3 tex_color(vec3 p, out vec2 texCoords)
{
  texCoords = p.xz*0.01 + vec2(0.5,-time*0.014);
  texCoords.x = fract(texCoords.x);
  texCoords.y = fract(texCoords.y);
  return texture2D(texture, texCoords).rgb;
}


vec2 obj(vec3 p){
  
  vec3 fp=stepspace(p,1.0);
  float d=sin(length(fp/2.0)*1.0-time*4.0)*(sin(length(fp/50.0)*4.0-time*1.0)*0.5+0.5);
	vec2 texCoords;
  vec3 color = tex_color(vec3(int(p.x+0.5),int(p.y),int(p.z+0.5)),texCoords);
  p.xz=sim2d(p.xz,1.0);
  
 // p.xy=rot(p.xy,d*1.4); 
 // p.xz=rot(p.xz,d*1.4);
  //using box-signed from http://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm
  vec3 b=vec3(0.4,0.05+color.r*5.0,0.4);
  vec3 h=abs(p)-b;
  float c1=min(max(h.x,max(h.y,h.z)),0.0)+length(max(h,0.0));

  return vec2(c1,1.0);
}

/// Object color
vec3 obj_c(vec3 p,float objid){
  vec2 fp=sim2d(p.xz-0.5,2.0);
  vec2 texCoords;
  vec3 color = tex_color(p,texCoords);
  if (fp.y>0.0) fp.x=-fp.x;
  if (fp.x>0.0) return color;// vec3(0.0,0.0,0.0);
//
 
}

//******************
// Scene End
//******************

void main(void){
  vec2 vPos=-1.0+2.0*gl_FragCoord.xy/resolution.xy;

  //Camera animation
  vec3 vuv=vec3(0,1,0);//Change camere up vector here
  vec3 vrp=vec3(0,1,0); //Change camere view here
  vec3 prp=cameraPosition + vec3(0.0,10.0,time); 

  //Camera setup
  vec3 vpn=normalize(vrp-prp);
  vec3 u=normalize(cross(vuv,vpn));
  vec3 v=cross(vpn,u);
  vec3 vcv=(prp+vpn);
  vec3 scrCoord=vcv+vPos.x*u*resolution.x/resolution.y+vPos.y*v;
  vec3 scp = normalize(scrCoord-prp);

  if (fisheye_direction(gl_FragCoord.xy,resolution,PI*0.5+cameraAngles.x,cameraAngles.y,cameraAngles.z,scp) < 0.0)
  {
    gl_FragColor = vec4(0.0,0.0,0.0, 1.0);
    return;
  }

  //Raymarching
  const float maxd=50.0; //Max depth
  const vec2 e=vec2(0.03,-0.03);
  vec2 s=vec2(0.6,0.0);
  vec3 c,p,n;

  float f=1.0;
  int numIter = 100;
  for(int i=0;i<numIter;i++){
    if (abs(s.x)<e.x||f>maxd) break;
    f+= s.x * f / float(numIter);
    p=prp+scp*f;
    s=obj(p);
  }
  
  if (f<maxd){
    c=obj_c(p,s.y);
    vec4 v=vec4(
	    obj(vec3(p+e.xyy)).x,obj(vec3(p+e.yyx)).x,
	    obj(vec3(p+e.yxy)).x,obj(vec3(p+e.xxx)).x);
    n=normalize(vec3(v.w+v.x-v.z-v.y,v.z+v.w-v.x-v.y,v.y+v.w-v.z-v.x));
    float b=dot(n,normalize(prp-p));
    gl_FragColor=vec4((b*c+pow(b,4.0))*(1.0-f*.02),1.0);
  }
  else gl_FragColor=vec4(0,0,0,1); //background color
}
