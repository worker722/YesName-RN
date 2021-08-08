package com.tn.more;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;

public class MainActivity extends ReactActivity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    IntentFilter filter = new IntentFilter(Intent.ACTION_SCREEN_OFF);
    BroadcastReceiver mReceiver = new BroadcastReceiver() {
      @Override
      public void onReceive(Context context, Intent intent) {
          Intent startMain = new Intent(Intent.ACTION_MAIN);
          startMain.addCategory(Intent.CATEGORY_HOME);
          startMain.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
          context.startActivity(startMain);
      }
    };
    registerReceiver(mReceiver, filter);
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */

  @Override
  protected String getMainComponentName() {
    return "YesName";
  }

  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new ReactNativeActivityDelegate(this, getMainComponentName());
  }
}
