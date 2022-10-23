package com.<%- project.package -%>;

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class <%- project.name -%>Module internal constructor(context: ReactApplicationContext?) :
  ReactContextBaseJavaModule(context) {

  override fun getName(): String {
    return NAME
  }

  // Example method
  // See https://reactnative.dev/docs/native-modules-android
  @ReactMethod
  fun multiply(a: Double, b: Double, promise: Promise) {
    <%- project.name -%>ModuleImpl.multiply(a, b, promise)
  }

  companion object {
    const val NAME = <%- project.name -%>ModuleImpl.NAME
  }
}
