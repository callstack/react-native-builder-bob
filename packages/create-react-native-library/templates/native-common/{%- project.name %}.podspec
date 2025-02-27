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

<% if (project.cpp) { -%>
  s.source_files = "ios/**/*.{h,m,mm}", "cpp/**/*.{hpp,cpp,c,h}"
<% } else if (project.swift) { -%>
  s.source_files = "ios/**/*.{h,m,mm,swift}"
<% } else if (project.arch !== "legacy") { -%>
  s.source_files = "ios/**/*.{h,m,mm,cpp}"
  s.private_header_files = "ios/generated/**/*.h"
<% } else { -%>
  s.source_files = "ios/**/*.{h,m,mm}"
<% } -%>
<% if (project.moduleConfig === "nitro-modules") { -%>

  load 'nitrogen/generated/ios/<%- project.name -%>+autolinking.rb'
  add_nitrogen_files(s)
<% } -%>

# Use install_modules_dependencies helper to install the dependencies if React Native version >=0.71.0.
# See https://github.com/facebook/react-native/blob/febf6b7f33fdb4904669f99d795eba4c0f95d7bf/scripts/cocoapods/new_architecture.rb#L79.
if respond_to?(:install_modules_dependencies, true)
  install_modules_dependencies(s)
else
  s.dependency "React-Core"
end
end
