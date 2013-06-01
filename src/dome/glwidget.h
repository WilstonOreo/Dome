#ifndef GLWIDGET_H
#define GLWIDGET_H

#include <QtOpenGL/QGLWidget>

#include <gex/prim.hpp>

class GLWidget : public QGLWidget
{
    Q_OBJECT
public:
    explicit GLWidget(QWidget *parent = 0);

    void mouseMoveEvent(QMouseEvent *event);
    void mousePressEvent(QMouseEvent *event);

      typedef enum { SELECT_KNEAREST, SELECT_RADIUS } SelectionMode;

      gex::Point3 selection;

      void update();

protected:
    virtual void initializeGL();
    virtual void resizeGL(int w, int h);
    virtual void paintGL();

private:
// is left mouse button pressed
bool lbutton;
float angle;
  float pointSizeSource;

  float pointSizeGrid;
  int gridSize;
  int renderMode;

  // some stateholders for mouse motion
  // last mouse position in window
  int old_x, old_y;
  float yaw, pitch;
  float lightYaw, lightPitch;

  gex::Point3 lightPos_;
  bool drawGrid;


signals:

public slots:

};

#endif // GLWIDGET_H
