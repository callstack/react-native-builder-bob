package com.<%- project.package -%>;

import com.facebook.react.bridge.Promise

/**
 * This is where the module implementation lives
 * The exposed methods can be defined in the `new` and `legacy` folders
 */
object <%- project.name -%>ModuleImpl {
  const val NAME = "<%- project.name -%>"

  fun multiply(a: Double, b: Double, promise: Promise) {
    promise.resolve(a * b)
  }
}
