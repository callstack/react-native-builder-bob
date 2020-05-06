#import <React/RCTBridgeModule.h>

<%if (project.useCpp==true) {%>
#ifdef __cplusplus

#import "example.h"

#endif
<%}%>

@interface <%= project.name %> : NSObject <RCTBridgeModule>

@end
