package com.<%- project.package %>;

import android.graphics.Color;

import androidx.annotation.Nullable;

import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

@ReactModule(name = <%- project.name -%>ViewManager.NAME)
public class <%- project.name -%>ViewManager extends <%- project.name -%>ViewManagerSpec<<%- project.name -%>View> {

  public static final String NAME = "<%- project.name -%>View";

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
  public void setColor(<%- project.name -%>View view, @Nullable String color) {
    view.setBackgroundColor(Color.parseColor(color));
  }
}
