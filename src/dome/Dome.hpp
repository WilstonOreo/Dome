#pragma once

#include "Projector.hpp"

namespace dome
{
  struct Dome
  {
    typedef gex::Point3 point_type;
    typedef typename point_type::scalar_type scalar_type;
    typedef std::array<Projector,3> projector_array_type;

    scalar_type domeRadius()
    {
      return domeDiameter*0.5;
    }

    scalar_type domeBaseRadius()
    {
      return sqrt(domeRadius()*domeRadius() - domeBaseHeight()*domeBaseHeight());
    }

    void initializeProjectors()
    {
      for (auto& _proj : projectors())
      {

      }
    }

    void getTowerPointDistance()
    {
    }

    TBD_PROPERTY_REF(scalar_type,towerPointHeight)
    TBD_PROPERTY_REF(scalar_type,domeDiameter)
    TBD_PROPERTY_REF(scalar_type,domeBaseHeight)
    TBD_PROPERTY_REF(projector_array_type,projectors)
  };
}
