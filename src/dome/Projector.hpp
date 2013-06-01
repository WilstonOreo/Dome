#pragma once

#include <gex/base.hpp>

namespace dome
{
  struct Projector
  {
    typedef gex::Point3 point_type;
    typedef typename point_type::scalar_type scalar_type;

    Projector() {} 

    void setViewAngle(scalar_type _horizontalAngle, scalar_type _uprightAngle)
    {
    }

    std::vector<gex::Ray3> calcViewRays(int _numX, int _numY)
    {
    }

    TBD_PROPERTY_REF(point_type,position)
    TBD_PROPERTY_REF(vec_type,view)
  };
}

