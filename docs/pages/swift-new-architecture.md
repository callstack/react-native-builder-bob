---
title: Swift with Turbo Modules and Fabric
---

For Turbo Modules and Fabric views, React Native expects the iOS entry point to stay in Objective-C. If you want to use Swift, you need to create a separate Swift class for the implementation and update our Objective-C code to act as a thin wrapper that forwards calls to the Swift implementation.

## Calling Swift from Objective-C

Swift can be called from Objective-C as long as the API is Objective-C compatible:

- Mark the class or exposed methods with `@objc`
- Inherit from `NSObject` or `UIView`
- Use types that Objective-C can bridge, such as `String`, `NSNumber`, `NSArray`, `NSDictionary`, and `UIColor`

The Objective-C wrapper also needs to import the generated Swift compatibility header, which is usually named `"<YourProjectName>-Swift.h"`:

```objc
#if __has_include("<YourProjectName>/<YourProjectName>-Swift.h")
#import "<YourProjectName>/<YourProjectName>-Swift.h"
#else
#import "<YourProjectName>-Swift.h"
#endif
```

The `#if __has_include` check is necessary to make the code work with `use_frameworks!` in the `Podfile`, which changes the import path for the generated header.

## Turbo Modules

To use Swift for a Turbo Module, you can create a Swift class (e.g. `<YourProjectName>Impl`) that contains the actual implementation of your module's methods. Then, update the Objective-C code (`<YourProjectName>.mm`) to use that Swift class.

Example Swift implementation for a Turbo Module that multiplies two numbers:

```swift
import Foundation
@objc(<YourProjectName>Impl)
final class <YourProjectName>Impl: NSObject {
  @objc
  func multiply(_ a: Double, b: Double) -> NSNumber {
    NSNumber(value: a * b)
  }
}
```

Then call this implementation from the Objective-C wrapper:

```objc
#import "<YourProjectName>.h"

// Add the import for the generated Swift header
// [!code highlight:5]
#if __has_include("<YourProjectName>/<YourProjectName>-Swift.h")
#import "<YourProjectName>/<YourProjectName>-Swift.h"
#else
#import "<YourProjectName>-Swift.h"
#endif

// Declare a private property for the Swift implementation
// [!code highlight:3]
@implementation <YourProjectName> {
  <YourProjectName>Impl *_impl;
}

// Initialize the Swift class on module creation
// [!code highlight:8]
- (instancetype)init
{
  if (self = [super init]) {
    _impl = [<YourProjectName>Impl new];
  }
  return self;
}

// Call the Swift implementation for the actual implementation
// [!code highlight:4]
- (NSNumber *)multiply:(double)a b:(double)b
{
  return [_impl multiply:a b:b];
}

// Keep rest of the boilerplate for module registration
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::Native<YourProjectName>SpecJSI>(params);
}

+ (NSString *)moduleName
{
  return @"<YourProjectName>";
}

@end
```

## Fabric Views

To use Swift for a Fabric view, you can create a Swift `UIView` subclass (e.g. `<YourProjectName>ViewImpl`) that contains the actual implementation of your view. Then, update the generated Objective-C code (`<YourProjectName>View.mm`) to use that Swift view.

Example Swift implementation for a Fabric view that applies a `color` prop:

```swift
import UIKit

@objc(<YourProjectName>ViewImpl)
final class <YourProjectName>ViewImpl: UIView {
  @objc
  func setColor(_ color: UIColor?) {
    backgroundColor = color
  }
}
```

Then call this implementation from the generated Objective-C++ wrapper:

```objc
#import "<YourProjectName>View.h"

// Add the import for the generated Swift header
// [!code highlight:5]
#if __has_include("<YourProjectName>/<YourProjectName>-Swift.h")
#import "<YourProjectName>/<YourProjectName>-Swift.h"
#else
#import "<YourProjectName>-Swift.h"
#endif

#import <React/RCTConversions.h>

#import <react/renderer/components/<YourProjectName>ViewSpec/ComponentDescriptors.h>
#import <react/renderer/components/<YourProjectName>ViewSpec/Props.h>
#import <react/renderer/components/<YourProjectName>ViewSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

// Declare a private property for the Swift view
// [!code highlight:3]
@implementation <YourProjectName>View {
  <YourProjectName>ViewImpl *_view;
}

// Keep the boilerplate for Fabric registration
// [!code highlight:4]
+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<<YourProjectName>ViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps =
        std::make_shared<const <YourProjectName>ViewProps>();
    _props = defaultProps;

    // Initialize the Swift view when the Fabric view is created
    _view = [<YourProjectName>ViewImpl new]; // [!code highlight]

    self.contentView = _view;
  }

  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &oldViewProps =
      *std::static_pointer_cast<<YourProjectName>ViewProps const>(_props);
  const auto &newViewProps =
      *std::static_pointer_cast<<YourProjectName>ViewProps const>(props);

  if (oldViewProps.color != newViewProps.color) {
    // Call methods on the Swift view when props are updated
    // It may be necessary to convert some types before passing them to Swift
    [_view setColor:RCTUIColorFromSharedColor(newViewProps.color)]; // [!code highlight]
  }

  [super updateProps:props oldProps:oldProps];
}

@end
```

## Notes

If Xcode does not pick up a new Swift file immediately, rerun `pod install` in `example/ios` and restart Xcode.
