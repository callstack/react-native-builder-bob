#ifdef RCT_NEW_ARCH_ENABLED
#import "RN<%- project.name -%>Spec.h"
#else
#import <React/RCTBridgeModule.h>
#endif

#ifdef RCT_NEW_ARCH_ENABLED
@interface <%- project.name -%> : NSObject <Native<%- project.name -%>Spec>
#else
@interface <%- project.name -%> : NSObject <RCTBridgeModule>
#endif

@end
