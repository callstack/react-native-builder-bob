package com.<%- project.package %>;

import android.view.View;

import androidx.annotation.Nullable;

import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ViewManagerDelegate;
import com.facebook.react.viewmanagers.<%- project.name -%>ViewManagerDelegate;
import com.facebook.react.viewmanagers.<%- project.name -%>ViewManagerInterface;
import com.facebook.soloader.SoLoader;

public abstract class <%- project.name -%>ViewManagerSpec<T extends View> extends SimpleViewManager<T> implements <%- project.name -%>ViewManagerInterface<T> {
  static {
    if (BuildConfig.CODEGEN_MODULE_REGISTRATION != null) {
      SoLoader.loadLibrary(BuildConfig.CODEGEN_MODULE_REGISTRATION);
    }
  }

  private final ViewManagerDelegate<T> mDelegate;

  public <%- project.name -%>ViewManagerSpec() {
    mDelegate = new <%- project.name -%>ViewManagerDelegate(this);
  }

  @Nullable
  @Override
  protected ViewManagerDelegate<T> getDelegate() {
    return mDelegate;
  }
}
