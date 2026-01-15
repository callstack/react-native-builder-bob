package com.<%- project.package %>

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule

class <%- project.name -%>Module(reactContext: ReactApplicationContext) :
  Native<%- project.name -%>Spec(reactContext) {

  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }
}
