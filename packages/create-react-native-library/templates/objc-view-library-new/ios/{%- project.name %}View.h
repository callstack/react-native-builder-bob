// This guard prevent this file to be compiled in the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
#import <React/RCTViewComponentView.h>
#import <UIKit/UIKit.h>

#ifndef <%- project.name -%>ViewNativeComponent_h
#define <%- project.name -%>ViewNativeComponent_h

NS_ASSUME_NONNULL_BEGIN

@interface <%- project.name -%>View : RCTViewComponentView
@end

NS_ASSUME_NONNULL_END

#endif /* <%- project.name -%>ViewNativeComponent_h */
#endif /* RCT_NEW_ARCH_ENABLED */
