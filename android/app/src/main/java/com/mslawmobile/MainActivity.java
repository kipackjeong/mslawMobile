package com.mslaw.app;

import com.reactnativenavigation.NavigationActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;

//react-native-splash-screen
import android.os.Bundle;
import org.devio.rn.splashscreen.SplashScreen;

public class MainActivity extends NavigationActivity {

  

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    SplashScreen.show(this); // here
    super.onCreate(savedInstanceState);
  }

  
}
