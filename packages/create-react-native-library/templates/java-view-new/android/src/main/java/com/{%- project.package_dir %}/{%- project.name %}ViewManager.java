package com.<%- project.package %>;

import android.graphics.Color;

import androidx.annotation.Nullable;

import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewManagerDelegate;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.viewmanagers.<%- project.name -%>ViewManagerDelegate;
import com.facebook.react.viewmanagers.<%- project.name -%>ViewManagerInterface;

@ReactModule(name = <%- project.name -%>ViewManager.NAME)
public class <%- project.name -%>ViewManager extends SimpleViewManager<<%- project.name -%>View> implements <%- project.name -%>ViewManagerInterface<<%- project.name -%>View> {

  public static final String NAME = "<%- project.name -%>View";

  private final ViewManagerDelegate<<%- project.name -%>View> mDelegate;

  public <%- project.name -%>ViewManager() {
    mDelegate = new <%- project.name -%>ViewManagerDelegate(this);
  }

  @Nullable
  @Override
  protected ViewManagerDelegate<<%- project.name -%>View> getDelegate() {
    return mDelegate;
  }

  @Override
  public String getName() {
    return NAME;
  }

  @Override
  public <%- project.name -%>View createViewInstance(ThemedReactContext context) {
    return new <%- project.name -%>View(context);
  }

  @Override
  @ReactProp(name = "color")
  public void setColor(<%- project.name -%>View view, String color) {
    view.setBackgroundColor(Color.parseColor(color));
  }
}
