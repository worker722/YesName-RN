#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <Firebase.h>

//viop--------------
#import "RNVoipCall.h"
#import <PushKit/PushKit.h>
#import "RNVoipPushKit.h"

#ifdef FB_SONARKIT_ENABLED
#import <FlipperKit/FlipperClient.h>
#import <FlipperKitLayoutPlugin/FlipperKitLayoutPlugin.h>
#import <FlipperKitUserDefaultsPlugin/FKUserDefaultsPlugin.h>
#import <FlipperKitNetworkPlugin/FlipperKitNetworkPlugin.h>
#import <SKIOSNetworkPlugin/SKIOSNetworkAdapter.h>
#import <FlipperKitReactPlugin/FlipperKitReactPlugin.h>

static void InitializeFlipper(UIApplication *application) {
  FlipperClient *client = [FlipperClient sharedClient];
  SKDescriptorMapper *layoutDescriptorMapper = [[SKDescriptorMapper alloc] initWithDefaults];
  [client addPlugin:[[FlipperKitLayoutPlugin alloc] initWithRootNode:application withDescriptorMapper:layoutDescriptorMapper]];
  [client addPlugin:[[FKUserDefaultsPlugin alloc] initWithSuiteName:nil]];
  [client addPlugin:[FlipperKitReactPlugin new]];
  [client addPlugin:[[FlipperKitNetworkPlugin alloc] initWithNetworkAdapter:[SKIOSNetworkAdapter new]]];
  [client start];
}
#endif
@import Firebase;

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [FIRApp configure];

#ifdef FB_SONARKIT_ENABLED
  InitializeFlipper(application);
#endif
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"YesName"
                                            initialProperties:nil];

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

// --- Handle updated push credentials
- (void)pushRegistry:(PKPushRegistry *)registry didUpdatePushCredentials:(PKPushCredentials *)credentials forType:(PKPushType)type {
  // Register VoIP push token (a property of PKPushCredentials) with server
  [RNVoipPushKit didUpdatePushCredentials:credentials forType:(NSString *)type];
}
 
- (void)pushRegistry:(PKPushRegistry *)registry didInvalidatePushTokenForType:(PKPushType)type
{
  // --- The system calls this method when a previously provided push token is no longer valid for use. No action is necessary on your part to reregister the push type. Instead, use this method to notify your server not to send push notifications using the matching push token.
}
 
// --- Handle incoming pushes (for ios <= 10)
- (void)pushRegistry:(PKPushRegistry *)registry didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(PKPushType)type {
   NSLog(@"Ajith");
  [RNVoipPushKit didReceiveIncomingPushWithPayload:payload forType:(NSString *)type];
}
 
// --- Handle incoming pushes (for ios >= 11)
- (void)pushRegistry:(PKPushRegistry *)registry didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(PKPushType)type withCompletionHandler:(void (^)(void))completion {
  if ([[UIApplication sharedApplication] applicationState] == UIApplicationStateActive) {
    return;
  }
  @try {
    NSDictionary *extra_data = [payload.dictionaryPayload valueForKeyPath:@"data"];
    if([extra_data objectForKey:@"incoming"] == nil){
      return;
    }
    Boolean incoming = [[extra_data objectForKey:@"incoming"] boolValue];
    if (incoming == YES) {
    } else {
        return;
    }
  } @catch (NSException *exception) {
    return;
  }
  NSString *callerName = @"MoRe is Calling";
  NSString *callerId = [[[NSUUID UUID] UUIDString] lowercaseString];
  NSString *handle = @"1234567890";
  NSString *handleType = @"generic";
  BOOL hasVideo = false;
  @try {
    callerName = [payload.dictionaryPayload[@"name"] isKindOfClass:[NSString class]] ?  [NSString stringWithFormat: @"%@ is Calling", payload.dictionaryPayload[@"name"]] : @"RNVoip is Calling";
    callerId = [payload.dictionaryPayload[@"uuid"] isKindOfClass:[NSString class]] ?  payload.dictionaryPayload[@"uuid"] : [[[NSUUID UUID] UUIDString] lowercaseString];
    handle = [payload.dictionaryPayload[@"handle"] isKindOfClass:[NSString class]] ?  payload.dictionaryPayload[@"handle"] : @"1234567890";
    handleType = [payload.dictionaryPayload[@"handleType"] isKindOfClass:[NSString class]] ?  payload.dictionaryPayload[@"handleType"] : @"generic";
    hasVideo = payload.dictionaryPayload[@"hasVideo"] ? true : false;
  } @catch (NSException *exception) {
    NSLog(@"Error PushKit payload %@", exception);
  } @finally {
    NSLog(@"RNVoip caller id ===> %@    callerName  ==> %@ handle  ==> %@",callerId, callerName, hasVideo ? @"true": @"false");
    NSDictionary *extra = [payload.dictionaryPayload valueForKeyPath:@"data"];
    [RNVoipCall reportNewIncomingCall:callerId handle:handle handleType:handleType hasVideo:hasVideo localizedCallerName:callerName fromPushKit: YES payload:extra withCompletionHandler:completion];
    [RNVoipPushKit didReceiveIncomingPushWithPayload:payload forType:(NSString *)type];
  }
}
- (void)applicationDidBecomeActive:(UIApplication *)application {
  //remove badge
  [UIApplication sharedApplication].applicationIconBadgeNumber = 0;
}
@end
