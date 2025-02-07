package com.margelo.nitro.<%- project.package %>

@DoNotStrip
class CrnlNitro : Hybrid<%- project.name %>Spec() {
  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }
}
