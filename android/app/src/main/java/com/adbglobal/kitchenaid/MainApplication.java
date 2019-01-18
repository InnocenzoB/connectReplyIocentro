package com.adbglobal.kitchenaid;

import android.app.Application;

import com.adb.iocentrop2p.iocentrop2pPackage;
import com.facebook.react.ReactApplication;
import com.testfairy.react.TestFairyPackage;
import com.adb.iocentrowhpoobconnectivity.RNIocentroWhpOobConnectivityPackage;
import com.balthazargronon.RCTZeroconf.ZeroconfReactPackage;
import com.zyu.ReactNativeWheelPickerPackage;
import im.shimo.react.prompt.RNPromptPackage;
import com.bgimage.BgImagePackage;
import br.com.classapp.RNSensitiveInfo.RNSensitiveInfoPackage;
import com.github.yamill.orientation.OrientationPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.lwansbrough.RCTCamera.RCTCameraPackage;
import com.brentvatne.react.ReactVideoPackage;
import com.horcrux.svg.SvgPackage;
import com.cmcewen.blurview.BlurViewPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new TestFairyPackage(),
            new RNIocentroWhpOobConnectivityPackage(),
            new ZeroconfReactPackage(),
            new ReactNativeWheelPickerPackage(),
            new RNPromptPackage(),
            new BgImagePackage(),
            new RNSensitiveInfoPackage(),
            new OrientationPackage(),
            new RNDeviceInfo(),
            new RCTCameraPackage(),
            new ReactVideoPackage(),
            new SvgPackage(),
            new BlurViewPackage(),
            new LinearGradientPackage(),
            new iocentrop2pPackage(),
            new RNI18nPackage(),
            new ReactNativePushNotificationPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
