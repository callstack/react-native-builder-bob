package com.<%- project.package -%>;

import androidx.annotation.NonNull;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class <%- project.name -%>Module extends ReactContextBaseJavaModule {
  public static final String NAME = <%- project.name -%>ModuleImpl.NAME;

  <%- project.name -%>Module(ReactApplicationContext context) {
    super(context);
  }

  @Override
  @NonNull
  public String getName() {
    return <%- project.name -%>ModuleImpl.NAME;
  }

  @ReactMethod
  public void multiply(double a, double b, Promise promise) {
    <%- project.name -%>ModuleImpl.multiply(a, b, promise);
  }
}
