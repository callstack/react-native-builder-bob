package com.<%- project.package %>;

import androidx.annotation.Nullable;

import android.content.Context;
import android.util.AttributeSet;

import android.view.View;

public class <%- project.name -%>View extends View {

  public <%- project.name -%>View(Context context) {
    super(context);
  }

  public <%- project.name -%>View(Context context, @Nullable AttributeSet attrs) {
    super(context, attrs);
  }

  public <%- project.name -%>View(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
    super(context, attrs, defStyleAttr);
  }

}
