package com.<%- project.package %>;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;

public class <%- project.name -%>Module extends <%- project.name -%>Spec {
  public static final String NAME = "<%- project.name -%>";

  <%- project.name -%>Module(ReactApplicationContext context) {
    super(context);
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

  public static native double nativeMultiply(double a, double b);
<% } -%>

  // Example method
  // See https://reactnative.dev/docs/native-modules-android
  @ReactMethod
  public void multiply(double a, double b, Promise promise) {
<% if (project.cpp) { -%>
    promise.resolve(nativeMultiply(a, b));
<% } else { -%>
    promise.resolve(a * b);
<% } -%>
  }
}
