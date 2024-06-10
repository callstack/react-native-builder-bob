#import <React/RCTViewManager.h>
#import <React/RCTUIManager.h>
#import "RCTBridge.h"
#import "Utils.h"

@interface <%- project.name -%>ViewManager : RCTViewManager
@end

@implementation <%- project.name -%>ViewManager

RCT_EXPORT_MODULE(<%- project.name -%>View)

- (UIView *)view
{
  return [[UIView alloc] init];
}

RCT_CUSTOM_VIEW_PROPERTY(color, NSString, UIView)
{
  [view setBackgroundColor: [Utils hexStringToColor:json]];
}

@end
