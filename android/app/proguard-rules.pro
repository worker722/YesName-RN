# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html
-keep class com.facebook.jni.** { *; }
# Add any project specific keep options here:
-keep class me.leolin.shortcutbadger.impl.AdwHomeBadger { <init>(...); }
-keep class me.leolin.shortcutbadger.impl.ApexHomeBadger { <init>(...); }
-keep class me.leolin.shortcutbadger.impl.AsusHomeLauncher { <init>(...); }
-keep class me.leolin.shortcutbadger.impl.DefaultBadger { <init>(...); }
-keep class me.leolin.shortcutbadger.impl.NewHtcHomeBadger { <init>(...); }
-keep class me.leolin.shortcutbadger.impl.NovaHomeBadger { <init>(...); }
-keep class me.leolin.shortcutbadger.impl.SolidHomeBadger { <init>(...); }
-keep class me.leolin.shortcutbadger.impl.SonyHomeBadger { <init>(...); }
-keep class me.leolin.shortcutbadger.impl.XiaomiHomeBadger { <init>(...); }