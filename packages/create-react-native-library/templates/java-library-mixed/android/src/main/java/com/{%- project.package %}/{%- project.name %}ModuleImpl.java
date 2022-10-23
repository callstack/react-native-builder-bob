package com.<%- project.package -%>;

/**
 * This is where the module implementation lives
 * The exposed methods can be defined in the `turbo` and `legacy` folders
 */
public class <%- project.name -%>ModuleImpl  {
  public static final String NAME = "<%- project.name -%>";

<% if (project.cpp) { -%>
  static {
    System.loadLibrary("cpp");
  }

  public static native double multiply(double a, double b);
<% } else { -%>
  public static double multiply(double a, double b) {
    return a * b;
  }
<% } -%>
}
