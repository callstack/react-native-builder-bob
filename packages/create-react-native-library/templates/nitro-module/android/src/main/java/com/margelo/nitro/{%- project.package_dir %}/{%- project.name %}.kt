package com.margelo.nitro.<%- project.package %>

class CrnlNitro : Hybrid<%- project.name %>Spec() {
  override val memorySize: Long
    get() = 0L

  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }
}
