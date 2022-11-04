package com.<%- project.package %>;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;

@ReactModule(name = <%- project.name -%>Module.NAME)
public class <%- project.name -%>Module extends ReactContextBaseJavaModule {
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
  @ReactMethod
  public void multiply(double a, double b, Promise promise) {
<% if (project.cpp) { -%>
    promise.resolve(nativeMultiply(a, b));
<% } else { -%>
    promise.resolve(a * b);
<% } -%>
  }
}
