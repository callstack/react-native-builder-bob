// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "<%- project.name -%>",
    platforms: [.iOS("15.1")],
    products: [
        .library(name: "<%- project.name -%>", targets: ["<%- project.name -%>"]),
    ],
    dependencies: [
        .package(name: "ReactNative", path: "../../../../xcframeworks"),
        .package(name: "React-GeneratedCode", path: "../../../ios"),
    ],
    targets: [
        .target(
            name: "<%- project.name -%>",
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
<% } -%>
                .define("DEBUG", .when(configuration: .debug)),
                .define("NDEBUG", .when(configuration: .release)),
            ]
        ),
    ],
    cxxLanguageStandard: .cxx20
)
