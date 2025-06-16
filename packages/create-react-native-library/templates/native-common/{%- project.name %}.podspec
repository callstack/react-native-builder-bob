require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "<%- project.name -%>"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "<%- repo -%>.git", :tag => "#{s.version}" }

<% if (project.moduleConfig !== "nitro-modules") { -%>
<% if (project.swift) { -%>
  s.source_files = "ios/**/*.{h,m,mm,swift}"
<% } else { -%>
  s.source_files = "ios/**/*.{h,m,mm,cpp}"
  s.private_header_files = "ios/**/*.h"
<% } -%>
<% } -%>

<% if (project.moduleConfig === "nitro-modules") { -%>
  s.source_files = [
    # Implementation (Swift)
    "ios/**/*.{swift}",
    # Autolinking/Registration (Objective-C++)
    "ios/**/*.{m,mm}",
    # Implementation (C++ objects)
    "cpp/**/*.{hpp,cpp}",
  ]

  s.pod_target_xcconfig = {
    # C++ compiler flags, mainly for folly.
    "GCC_PREPROCESSOR_DEFINITIONS" => "$(inherited) FOLLY_NO_CONFIG FOLLY_CFG_NO_COROUTINES"
  }

  s.dependency 'React-jsi'
  s.dependency 'React-callinvoker'

  load 'nitrogen/generated/ios/<%- project.name -%>+autolinking.rb'
  add_nitrogen_files(s)
<% } -%>

 install_modules_dependencies(s)
end
