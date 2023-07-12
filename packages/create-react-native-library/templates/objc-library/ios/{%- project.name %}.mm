#import "<%- project.name -%>.h"

@implementation <%- project.name -%>

RCT_EXPORT_MODULE()

<% if (project.arch === 'legacy' || project.arch === 'mixed') { -%>
// Example method
// See // https://reactnative.dev/docs/native-modules-ios
RCT_EXPORT_METHOD(multiply:(double)a
                  b:(double)b
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
<% if (project.cpp) { -%>
    NSNumber *result = @(<%- project.package_cpp -%>::multiply(a, b));
<% } else { -%>
    NSNumber *result = @(a * b);
<% } -%>

    resolve(result);
}

<% } -%>
<% if (project.arch === 'new' || project.arch === 'mixed') { -%>
// Don't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
<% if (project.arch === 'new') { -%>
- (NSNumber *)multiply:(double)a b:(double)b {
<% if (project.cpp) { -%>
    NSNumber *result = @(<%- project.package_cpp -%>::multiply(a, b));
<% } else { -%>
    NSNumber *result = @(a * b);
<% } -%>

    return result;
}

<% } -%>
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::Native<%- project.name -%>SpecJSI>(params);
}
#endif
<% } -%>

@end
