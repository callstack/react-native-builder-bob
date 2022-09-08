package com.<%- project.package -%>;

import com.facebook.react.uimanager.ThemedReactContext;
import android.graphics.Color;

public class <%- project.name -%>ViewManagerImpl {

  public static final String NAME = "<%- project.name -%>View";

  public static <%- project.name -%>View createViewInstance(ThemedReactContext context) {
    return new <%- project.name -%>View(context);
  }

  public static void setColor(<%- project.name -%>View view, String color) {
    view.setBackgroundColor(Color.parseColor(color));
  }
}
