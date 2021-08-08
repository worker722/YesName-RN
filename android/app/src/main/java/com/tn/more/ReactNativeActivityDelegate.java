package com.tn.more;

import android.app.Activity;
import android.os.Bundle;

import androidx.annotation.Nullable;

import com.facebook.react.ReactActivityDelegate;

public class ReactNativeActivityDelegate extends ReactActivityDelegate {
    private Activity activity;

    public ReactNativeActivityDelegate(Activity activity, @Nullable String mainComponentName) {
        super(activity, mainComponentName);
        this.activity = activity;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Nullable
    @Override
    protected Bundle getLaunchOptions() {
        Bundle bundle = new Bundle();
        bundle.putString("default_key", "DEFAULT");
        if(this.activity.getIntent().getExtras() != null) {
            Bundle callerBundle = this.activity.getIntent().getExtras();
           bundle.putString("action", callerBundle.getString("action"));
           bundle.putString("callerId", callerBundle.getString("callerId"));
           bundle.putString("notificationId", callerBundle.getString("notificationId"));
           bundle.putString("roomid", callerBundle.getString("roomid"));
           bundle.putString("type", callerBundle.getString("type"));
        }
        return bundle;
    }
}
