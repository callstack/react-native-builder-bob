#include "<%- project.name -%>Impl.h"

namespace facebook::react {

<%- project.name -%>Impl::<%- project.name -%>Impl(
  std::shared_ptr<CallInvoker> jsInvoker
)
  : Native<%- project.name -%>CxxSpec(std::move(jsInvoker)) {}

double <%- project.name -%>Impl::multiply(
  jsi::Runtime& rt,
  double a,
  double b
) {
  return a * b;
}

}
