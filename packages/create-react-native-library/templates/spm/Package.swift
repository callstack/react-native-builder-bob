// swift-tools-version: 6.0
<%
// Must match the name React Native's SPM autolinker derives from the package name
const spmName = project.slug
  .replace(/^@[^/]+\//, '')
  .split(/[^a-zA-Z0-9]+/)
  .filter(Boolean)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join('');
-%>
import PackageDescription

let package = Package(
    name: "<%- spmName -%>",
    platforms: [.iOS(.v15)],
    products: [
        .library(name: "<%- spmName -%>", targets: ["<%- spmName -%>"]),
    ],
    dependencies: [
        .package(name: "ReactNative", path: "../../../../xcframeworks"),
        .package(name: "React-GeneratedCode", path: "../../../ios"),
    ],
    targets: [
        .target(
            name: "<%- spmName -%>",
            dependencies: [
                .product(name: "ReactHeaders", package: "ReactNative"),
                .product(name: "ReactNativeHeaders", package: "ReactNative"),
                .product(name: "ReactNativeDependenciesHeaders", package: "ReactNative"),
                .product(name: "ReactAppHeaders", package: "React-GeneratedCode"),
            ],
            path: ".",
            // SwiftPM scans the whole path for resources, even outside `sources`
            // Without this, the example app in the library's repo fails with "multiple resources named ..."
            exclude: ["example", "node_modules"],
<% if (project.cpp) { -%>
            sources: ["ios", "cpp"],
<% } else { -%>
            sources: ["ios"],
<% } -%>
            publicHeadersPath: "ios",
            cxxSettings: [
<% if (project.cpp) { -%>
                .headerSearchPath("cpp"),
                .headerSearchPath("ios/generated/ReactCodegen"),
<% } -%>
                .define("DEBUG", .when(configuration: .debug)),
                .define("NDEBUG", .when(configuration: .release)),
            ]
        ),
    ],
    cxxLanguageStandard: .cxx20
)
