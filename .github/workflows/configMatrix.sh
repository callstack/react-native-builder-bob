#!/bin/bash

# Source this file to set up the environment for the tests.

export libraryTypes=( 
  module-legacy 
  module-mixed 
  module-new 
  view-legacy 
  view-mixed 
  view-new 
)

export languages=( 
  java-objc 
  java-swift 
  kotlin-objc 
  kotlin-swift 
)

export exclude=(
  module-new/java-swift
  module-new/kotlin-swift
  module-mixed/java-swift
  module-mixed/kotlin-swift
  view-new/java-swift
  view-new/kotlin-swift
  view-mixed/java-swift
  view-mixed/kotlin-swift
)
