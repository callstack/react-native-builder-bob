package com.<%- project.package %>

import com.facebook.react.bridge.ReactApplicationContext

class <%- project.name -%>Module(reactContext: ReactApplicationContext) :
  Native<%- project.name -%>Spec(reactContext) {

  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  companion object {
    const val NAME = Native<%- project.name -%>Spec.NAME
  }
}
