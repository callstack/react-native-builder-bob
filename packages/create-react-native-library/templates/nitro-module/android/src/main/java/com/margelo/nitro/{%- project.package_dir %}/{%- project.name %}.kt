package com.margelo.nitro.<%- project.package %>
  
import com.facebook.proguard.annotations.DoNotStrip

@DoNotStrip
class <%- project.name %> : Hybrid<%- project.name %>Spec() {
  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }
}
