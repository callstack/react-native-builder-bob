package com.<%- project.package %>

import android.graphics.Color
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

@ReactModule(name = <%- project.name -%>ViewManager.NAME)
class <%- project.name -%>ViewManager :
  <%- project.name -%>ViewManagerSpec<<%- project.name -%>View>() {
  override fun getName(): String {
    return NAME
  }

  public override fun createViewInstance(context: ThemedReactContext): <%- project.name -%>View {
    return <%- project.name -%>View(context)
  }

  @ReactProp(name = "color")
  override fun setColor(view: <%- project.name -%>View?, color: String?) {
    view?.setBackgroundColor(Color.parseColor(color))
  }

  companion object {
    const val NAME = "<%- project.name -%>View"
  }
}
