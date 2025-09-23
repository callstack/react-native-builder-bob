#import "<%- project.name -%>.h"

@implementation <%- project.name -%>

- (NSNumber *)multiply:(double)a b:(double)b {
    NSNumber *result = @(a * b);

    return result;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::Native<%- project.name -%>SpecJSI>(params);
}

+ (NSString *)moduleName
{
  return @"<%- project.name -%>";
}

@end
