<% if (project.cpp) { -%>
#ifdef __cplusplus
#import "<%- project.identifier -%>.h"
#endif
<% } -%>

<% if (project.arch === 'new') { -%>
#import "RN<%- project.name -%>Spec/RN<%- project.name -%>Spec.h"

@interface <%- project.name -%> : NSObject <Native<%- project.name -%>Spec>
<% } else { -%>
#import <React/RCTBridgeModule.h>

@interface <%- project.name -%> : NSObject <RCTBridgeModule>
<% } -%>

@end
