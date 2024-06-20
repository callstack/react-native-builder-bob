<% if (project.cpp) { -%>
#ifdef __cplusplus
#import "<%- project.identifier -%>.h"
#endif
<% } -%>

#ifdef RCT_NEW_ARCH_ENABLED
#import "RN<%- project.name -%>Spec.h"

@interface <%- project.name -%> : NSObject <Native<%- project.name -%>Spec>
#else
#import <React/RCTBridgeModule.h>

@interface <%- project.name -%> : NSObject <RCTBridgeModule>
#endif

@end
