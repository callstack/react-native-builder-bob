package com.<%- project.package %>

import com.facebook.react.bridge.ReactApplicationContext

abstract class <%- project.name -%>Spec internal constructor(context: ReactApplicationContext) :
  Native<%- project.name -%>Spec(context) {
}
