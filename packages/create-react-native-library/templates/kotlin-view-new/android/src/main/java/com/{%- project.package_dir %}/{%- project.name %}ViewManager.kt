package com.<%- project.package %>

import android.graphics.Color
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.<%- project.name -%>ViewManagerInterface
import com.facebook.react.viewmanagers.<%- project.name -%>ViewManagerDelegate
import com.facebook.soloader.SoLoader

@ReactModule(name = <%- project.name -%>ViewManager.NAME)
class <%- project.name -%>ViewManager : SimpleViewManager<<%- project.name -%>View>(),
  <%- project.name -%>ViewManagerInterface<<%- project.name -%>View> {
  private val mDelegate: ViewManagerDelegate<<%- project.name -%>View>

  init {
    mDelegate = <%- project.name -%>ViewManagerDelegate(this)
  }

  override fun getDelegate(): ViewManagerDelegate<<%- project.name -%>View>? {
    return mDelegate
  }

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

    init {
      if (BuildConfig.CODEGEN_MODULE_REGISTRATION != null) {
        SoLoader.loadLibrary(BuildConfig.CODEGEN_MODULE_REGISTRATION)
      }
    }
  }
}
