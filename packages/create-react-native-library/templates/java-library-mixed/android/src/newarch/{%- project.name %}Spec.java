package com.<%- project.package %>;

import com.facebook.react.bridge.ReactApplicationContext;

abstract class <%- project.name -%>Spec extends Native<%- project.name -%>Spec {
  <%- project.name -%>Spec(ReactApplicationContext context) {
    super(context);
  }
}
