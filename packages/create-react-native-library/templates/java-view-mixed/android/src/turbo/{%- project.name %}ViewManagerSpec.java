package com.<%- project.package -%>;

import android.view.View;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ViewManagerDelegate;
import com.facebook.react.viewmanagers.<%- project.name -%>ViewManagerDelegate;
import com.facebook.react.viewmanagers.<%- project.name -%>ViewManagerInterface;

public abstract class <%- project.name -%>ViewManagerSpec<T extends View> extends SimpleViewManager<T> implements <%- project.name -%>ViewManagerInterface<T> {
  private final ViewManagerDelegate<T> mDelegate;

  public <%- project.name -%>ViewManagerSpec(ReactApplicationContext context) {
    mDelegate = new <%- project.name -%>ViewManagerDelegate(this);
  }

  @Override
  protected ViewManagerDelegate<T> getDelegate() {
    return mDelegate;
  }
}
