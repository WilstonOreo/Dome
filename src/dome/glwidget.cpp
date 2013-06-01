
#include "glwidget.h"

#include "helper.h"
#include <GL/glu.h>
#include <GL/glut.h>

#include <gex/color.hpp>

GLWidget::GLWidget(QWidget *parent) :
  QGLWidget(QGLFormat(QGL::DoubleBuffer | QGL::DepthBuffer | QGL::Rgba | QGL::AlphaChannel | QGL::DirectRendering), parent),
  yaw(0), pitch(0), old_x(0), old_y(0), lightYaw(0), lightPitch(0)
{
}

void GLWidget::initializeGL()
{
    // Set up the rendering context, define display lists etc.:
    glClearColor(1.0, 1.0, 1.0, 1.0);
    glEnable(GL_DEPTH_TEST);
    //glDepthFunc(GL_LEQUAL);

    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

    glEnable(GL_LINE_SMOOTH);
    glHint(GL_LINE_SMOOTH_HINT, GL_NICEST);

    glEnable(GL_POINT_SMOOTH);
    glHint(GL_POINT_SMOOTH_HINT, GL_NICEST);

    glEnable(GL_CULL_FACE);

  /*glMaterialfv(GL_FRONT, GL_AMBIENT, mat_ambient);
glMaterialfv(GL_FRONT, GL_SPECULAR, mat_specular);
glMaterialfv(GL_FRONT, GL_SHININESS, mat_shininess);*/

  // set light
  {
    lightPos_(0.0,20.0,20.0);
    gex::Color3<> ambient_(0.1,0.1,0.1);
    gex::Color3<> diffuse_(1.0,1.0,1.0);
    glEnable(GL_LIGHTING);

    // light and material
    glEnable(GL_COLOR_MATERIAL);
    glLightfv(GL_LIGHT0, GL_DIFFUSE, &diffuse_[0]);
    glLightfv(GL_LIGHT0, GL_POSITION, &lightPos_[0]);
    glLightModelfv(GL_LIGHT_MODEL_TWO_SIDE, &ambient_[0] );
    glShadeModel(GL_SMOOTH);
    
  }
  glEnable(GL_NORMALIZE);

    // fix outlines z-fighting withthe quads
    glPolygonOffset(1, 1);
    glEnable(GL_POLYGON_OFFSET_FILL);
    

  setAutoBufferSwap(true);
}

void GLWidget::update()
{
  paintGL();
}

void GLWidget::resizeGL(int w, int h)
{

  w = w & ~1; h = h & ~1;
    // setup viewport, projection etc.:
    glViewport(0, 0, (GLint)w, (GLint)h);

	// reshaped window aspect ratio
	float aspect = (float) w / (float) h;

// restore view definition after window reshape
	glMatrixMode(GL_PROJECTION);
	glLoadIdentity();
  // perspective projection
	gluPerspective(60.0, aspect, 1.0, 100.0);
	  
	GLdouble centerX= 0;
	GLdouble centerY= 0;
	GLdouble centerZ= 0;
  // set camera parameters
  GLdouble eyeX=1;//15;// *cos(angle/100.0);
	GLdouble eyeY=1;//20; // pointCloud.boundingBox().size().y*1.5;
	GLdouble eyeZ=1;//15;// *sin(angle/100.0); 
	GLdouble upX=0;
	GLdouble upY=1;
	GLdouble upZ=0;

  gluLookAt(eyeX,eyeY,eyeZ,centerX,centerY,centerZ,upX,upY,upZ);
	
    // clear background and depth buffer
	glClearColor(0.0,0.0,0.0,1.0);
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

	glMatrixMode(GL_MODELVIEW);

}

gex::Point3 unProject(QPoint const & pos)
{
    GLdouble projection[16];
    glGetDoublev(GL_PROJECTION_MATRIX, projection);

    GLdouble modelView[16];
    glGetDoublev(GL_MODELVIEW_MATRIX, modelView);

    GLint viewport[4];
    glGetIntegerv(GL_VIEWPORT, viewport);

    double winX = pos.x();
    double winY = viewport[3] - pos.y();

    GLfloat winZ;
    glReadPixels(winX, winY, 1, 1, GL_DEPTH_COMPONENT, GL_FLOAT, &winZ);

    GLdouble x,y,z;
    gluUnProject(winX, winY, winZ, modelView, projection, viewport, &x,&y,&z);
    return gex::Point3(x,y,z);
}

#define GEX_COORDS3(c) c.x(),c.y(),c.z()

void draw(const gex::Sphere& _sphere)
{
		glPushMatrix();
		glTranslatef(GEX_COORDS3(_sphere.center()));
		glutSolidSphere(_sphere.radius(), 32, 32);
		glPopMatrix();
}


void GLWidget::paintGL()
{
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    //glPointSize(pointSize);
  glLoadIdentity();
  glRotatef(pitch, 1, 0, 0);
  glRotatef(yaw, 0, 1, 0);
  
    gex::Vec3 c(10,10,10); // = 0.5*(pointCloud.boundingBox().max.vec3f() + pointCloud.boundingBox().min.vec3f());
    glTranslatef(-c.x(),-c.y(),-c.z());

    gex::Sphere _sphere(7.5,gex::Vec3(0.0,0.0,3.75));

  glEnable(GL_DEPTH_TEST);
  glDisable(GL_CULL_FACE);
  glMatrixMode(GL_MODELVIEW);
    
  glLightfv(GL_LIGHT0, GL_POSITION, lightPos_.p());
    glEnable(GL_LIGHTING);

    draw(_sphere);
    glDisable(GL_LIGHTING);


//    pointCloud.draw(cg2::Color(0.8,0.5,0.0));

    /*glPointSize(pointSize*4.0);
    glBegin(GL_POINTS);
    glColor3f(1.0,0.0,0.0);
    //glVertex3f(selection.x,selection.y,selection.z);
    glEnd();
*/
    swapBuffers();
}



// mouse motion
void GLWidget::mouseMoveEvent(QMouseEvent *event)
{
  int dx = event->x() - old_x;
  int dy = event->y() - old_y;
  if (event->buttons() == Qt::LeftButton)
  {
    yaw += dx;
    pitch += dy;

    std::cout << yaw << " " << pitch << std::endl;

    if (pitch > 90)
    {
      pitch = 90;
    }
    if (pitch < -90)
    {
      pitch = -90;
    }
    updateGL();

  }
  if (event->buttons() == Qt::RightButton)
  {
    lightYaw += dx;
    lightPitch += dy;
    if (lightPitch > 90)
    {
      lightPitch = 90;
    }
    if (lightPitch < -90)
    {
      lightPitch = -90;
    }
    
    lightPos_(cos(lightYaw*0.017453292)*6, 4, sin(lightYaw*0.017453292)*6);
    
    updateGL();
  }
  old_x = event->x();
  old_y = event->y();
}

// mouse callback
void GLWidget::mousePressEvent(QMouseEvent *event)
{
  if (event->button() != Qt::NoButton)
  {
    old_x = event->x();
    old_y = event->y();

    updateGL();
  }
}


