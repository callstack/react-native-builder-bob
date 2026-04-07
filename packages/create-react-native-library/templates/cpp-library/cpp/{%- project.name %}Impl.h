#pragma once

#include <<%- project.name -%>SpecJSI.h>

#include <memory>

namespace facebook::react {

class <%- project.name -%>Impl
  : public Native<%- project.name -%>CxxSpec<<%- project.name -%>Impl> {
public:
  <%- project.name -%>Impl(std::shared_ptr<CallInvoker> jsInvoker);

  double multiply(jsi::Runtime& rt, double a, double b);
};

}
