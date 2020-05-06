#import "<%= project.name %>.h"

@implementation <%= project.name %>

RCT_EXPORT_MODULE()

// Example method
// See // https://facebook.github.io/react-native/docs/native-modules-ios
RCT_REMAP_METHOD(getDeviceName,
                 findEventsWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  UIDevice *deviceInfo = [UIDevice currentDevice];

  resolve(deviceInfo.name);
}

<%if (project.useCpp==true) {%>
RCT_EXPORT_METHOD(multiply:(nonnull NSNumber*)a withB:(nonnull NSNumber*)b resolver:(RCTPromiseResolveBlock)resolve
withReject:(RCTPromiseRejectBlock)reject)
{
    long result = example::multiply([a longValue], [b longValue]);

    resolve(@(result));
}
<%}%>

@end
