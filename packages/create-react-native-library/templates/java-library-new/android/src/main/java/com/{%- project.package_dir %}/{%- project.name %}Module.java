package com.<%- project.package %>;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.annotations.ReactModule;

@ReactModule(name = <%- project.name -%>Module.NAME)
public class <%- project.name -%>Module extends Native<%- project.name -%>Spec {
  public static final String NAME = "<%- project.name -%>";

  public <%- project.name -%>Module(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }

<% if (project.cpp) { -%>
  static {
    System.loadLibrary("cpp");
  }

  private static native double nativeMultiply(double a, double b);
<% } -%>

  // Example method
  // See https://reactnative.dev/docs/native-modules-android
  @Override
  public double multiply(double a, double b) {
<% if (project.cpp) { -%>
    return nativeMultiply(a, b);
<% } else { -%>
    return a * b;
<% } -%>
  }
}
