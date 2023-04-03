package com.<%- project.package %>

import android.view.View

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.<%- project.name -%>ViewManagerDelegate
import com.facebook.react.viewmanagers.<%- project.name -%>ViewManagerInterface
import com.facebook.soloader.SoLoader

abstract class <%- project.name -%>ViewManagerSpec<T : View> : SimpleViewManager<T>(), <%- project.name -%>ViewManagerInterface<T> {
  private val mDelegate: ViewManagerDelegate<T>

  init {
    mDelegate = <%- project.name -%>ViewManagerDelegate(this)
  }

  override fun getDelegate(): ViewManagerDelegate<T>? {
    return mDelegate
  }

  companion object {
    init {
      if (BuildConfig.CODEGEN_MODULE_REGISTRATION != null) {
        SoLoader.loadLibrary(BuildConfig.CODEGEN_MODULE_REGISTRATION)
      }
    }
  }
}
