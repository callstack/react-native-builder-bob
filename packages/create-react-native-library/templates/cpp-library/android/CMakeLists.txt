cmake_minimum_required(VERSION 3.4.1)
project(<%- project.name -%>)

set (CMAKE_VERBOSE_MAKEFILE ON)

add_library(
    <%- project.identifier -%>
    STATIC
    ../cpp/<%- project.name -%>Impl.cpp
)

set_target_properties(
    <%- project.identifier -%> PROPERTIES
    CXX_STANDARD 20
    CXX_STANDARD_REQUIRED ON
    CXX_EXTENSIONS OFF
)

target_include_directories(
    <%- project.identifier -%>
    PUBLIC
    ../cpp
)

target_link_libraries(
    <%- project.identifier -%>
    jsi
    reactnative
    react_codegen_<%- project.name -%>Spec
)
