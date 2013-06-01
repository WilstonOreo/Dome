#include "MainWindow.h"

MainWindow::MainWindow(QMainWindow *parent) : QMainWindow(parent)
{
  setupUi(this);
/*
  connect(btnInRadius,SIGNAL(clicked()), this, SLOT(setSelectionMode()));
  connect(btnKNearest,SIGNAL(clicked()), this, SLOT(setSelectionMode()));
  connect(spinBox,SIGNAL(editingFinished()), this, SLOT(setKNearest()));
  connect(doubleSpinBox,SIGNAL(editingFinished()), this, SLOT(setRadius()));
  connect(doubleSpinBox_3,SIGNAL(editingFinished()), this, SLOT(setPointSize()));
  connect(spinBox,SIGNAL(valueChanged(int)), this, SLOT(setKNearest()));
  connect(boxVertexId,SIGNAL(valueChanged(int)), this, SLOT(setVertexId()));
  connect(doubleSpinBox,SIGNAL(valueChanged(double)), this, SLOT(setRadius()));
  connect(doubleSpinBox_3,SIGNAL(valueChanged(double)), this, SLOT(setPointSize()));
  connect(boxRenderKDTree,SIGNAL(clicked()), this, SLOT(setDrawKDTree()));*/
}

MainWindow::~MainWindow()
{
}


void MainWindow::setRadius()
{
  glWidget->update();
}

