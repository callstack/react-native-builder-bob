gem 'xcodeproj'
require 'xcodeproj'

project_path = ARGV[0]
target_name = ARGV[1]
project = Xcodeproj::Project.open(project_path)

project.targets.each do |target|
  if target.name == target_name
    swift_file = File.join(project.path, '..', 'File.swift')
    group = project.groups.select {|i| i.name == target_name }.first
    file = group&.new_file(swift_file)
    target.add_file_references([file])
  end
end
project.save