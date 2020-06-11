require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "<%= project.podspec %>"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "9.0" }
  s.source       = { :git => "<%= repo %>.git", :tag => "#{s.version}" }

  <% if (project.cpp) { %>
  s.source_files = "ios/**/*.{h,m,mm}", "cpp/**/*.{h,cpp}"
  <% } else if (project.swift) { %>
  s.source_files = "ios/**/*.{h,m,mm,swift}"
  <% } else { %>
  s.source_files = "ios/**/*.{h,m,mm}"
  <% } %>

  s.dependency "React"
end
