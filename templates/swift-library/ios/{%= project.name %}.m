#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(<%= project.name %>, NSObject)

RCT_EXTERN_METHOD(multiply:(float)a withB:(float)b
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

@end
