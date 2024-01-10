import React, {useEffect, useMemo, useRef} from 'react';
import {Navigation} from 'react-native-navigation';
import SplashScreen from 'react-native-splash-screen';
import WebView from 'react-native-webview';
import {
  Alert,
  BackHandler,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
} from 'react-native';
import RNFetchBlob, {RNFetchBlobConfig} from 'rn-fetch-blob';
import * as KakaoLogin from '@react-native-seoul/kakao-login';
import NaverLogin from '@react-native-seoul/naver-login';

function postMessageToWeb(wvRef: React.RefObject<WebView<{}>>, message: any) {
  wvRef.current?.postMessage(JSON.stringify(message));
}
function App(props: any) {
  const wvRef = useRef<WebView>(null);

  useEffect(() => {
    SplashScreen.hide();
  }, []);
  const logout = async () => {
    try {
      await KakaoLogin.logout();
      await KakaoLogin.unlink();
    } catch (error) {}
    try {
      await NaverLogin.logout();
    } catch (error) {}

    const message = {
      type: 'logout_webview',
    };
    postMessageToWeb(wvRef, message);
  };
  const kakaoLogin = async (redirect: string): Promise<void> => {
    try {
      const token = await KakaoLogin.login();

      const profile: KakaoLogin.KakaoProfile = await KakaoLogin.getProfile();
      const message = {
        type: 'kakao_profile',
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        kakaoId: profile.id,
        profileImage: profile.profileImageUrl,
        thumbnailImage: profile.thumbnailImageUrl,
        email: profile.email,
        nickname: profile.nickname,
        redirect,
      };

      console.log(message);

      postMessageToWeb(wvRef, message);
    } catch (error) {
      Alert.alert('카카오 로그인 실패');
    }
  };
  const naverLogin = async (redirect: string): Promise<void> => {
    try {
      const consumerKey = process.env.NAVER_CONSUMER_KEY || '';
      const consumerSecret = process.env.NAVER_CONSUMER_SECRET || '';
      const appName = 'ALLAW';
      const serviceUrlScheme = process.env.NAVER_SERVICE_URL_SCHEME || '';

      const {failureResponse, successResponse} = await NaverLogin.login({
        appName,
        consumerKey,
        consumerSecret,
        serviceUrlScheme,
      });

      console.log('failureResponse: ', failureResponse);
      console.log('successResponse: ', successResponse);

      if (failureResponse) {
        throw Error(failureResponse.message);
      }
      const {accessToken, refreshToken} = successResponse!;

      const profile = await NaverLogin.getProfile(successResponse!.accessToken);

      console.log('profile.response: ', profile.response);

      const message = {
        type: 'naver_profile',
        accessToken,
        refreshToken,
        naverId: profile.response.id,
        profileImage: profile.response.profile_image,
        email: profile.response.email,
        nickname: profile.response.nickname,
        redirect,
      };
      postMessageToWeb(wvRef, message);
    } catch (error) {
      Alert.alert('네이버 로그인 실패');
    }
  };

  const handleBackButtonPress = (): boolean | null => {
    try {
      wvRef.current?.goBack();
      return true;
    } catch (error) {
      console.log('[handleBackButtonPress] Error : ', error);
      return false;
    }
  };

  const majorVersionIOS = useMemo(
    () => parseInt(Platform.Version as string, 10),
    [],
  );

  async function downloadTemplate(downloadId: string, templateName: string) {
    console.log('downloadTemplate');
    const downloadUrl = `https://api.allaw.kr/inquiry/${downloadId}/download`;

    //https://www.sortedpoint.com/how-to-download-file-react-native-app-android-ios/
    if (Platform.OS === 'android') {
      // android
      const granted = await getDownloadPermissionAndroid();
      if (granted) {
        await downloadFile(downloadUrl, templateName);
      }
    } else {
      // ios
      const res = await downloadFile(downloadUrl, templateName);
      if (res) {
        setTimeout(() => {
          RNFetchBlob.fs.writeFile(res.path(), res.data, 'base64');
          RNFetchBlob.ios.openDocument(res.path());
        }, 400);
      }
    }
  }

  const getDownloadPermissionAndroid = async () => {
    try {
      const check = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      if (check) {
        console.log('Permission is already granted');
        return true;
      }
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'File Download Permission',
          message: 'Your permission is required to save Files to your device',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      console.log('granted', granted);
      if (
        granted === PermissionsAndroid.RESULTS.GRANTED ||
        granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
      ) {
        console.log('Granted access for the storage');
        return true;
      }
    } catch (err) {
      console.log('err', err);
    }
    return false;
  };

  const downloadFile = async (url: string, filename: string) => {
    // Get the app's cache directory
    const {fs} = RNFetchBlob;
    const fileExtension = 'docx';
    const fileNameWithExtension = `${filename}.${fileExtension}`;

    // Generate a unique filename for the downloaded image
    const androidFilePath = `${fs.dirs.DownloadDir}/${fileNameWithExtension}`;

    let iosFilePath;
    if (majorVersionIOS >= 17) {
      iosFilePath = `${fs.dirs.CacheDir}/${fileNameWithExtension}`;
    } else {
      iosFilePath = `${fs.dirs.DownloadDir}/${fileNameWithExtension}`;
    }

    try {
      // Download the file and save it to the cache directory
      const configOptions: RNFetchBlobConfig = Platform.select({
        ios: {
          fileCache: true,
          path: iosFilePath,
        },
        android: {
          fileCache: true,
          path: androidFilePath,
          addAndroidDownloads: {
            // Related to the Android only
            useDownloadManager: true,
            notification: true,
            path: androidFilePath,
            description: 'File',
          },
        },
      }) as RNFetchBlobConfig;

      const response = await RNFetchBlob.config(configOptions).fetch(
        'GET',
        url,
      );

      // Return the path to the downloaded file
      return response;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonPress);
    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        handleBackButtonPress,
      );
    };
  }, []);

  return (
    <SafeAreaView style={{flex: 1}}>
      <WebView
        ref={wvRef}
        style={{flex: 1}}
        source={{
          uri: 'https://allaw.kr/',
        }}
        onMessage={async event => {
          const fromWV = JSON.parse(event.nativeEvent.data);
          const {message, userCode, data} = fromWV;
          switch (message) {
            case 'kakao_login':
              kakaoLogin(fromWV.redirect);
              break;
            case 'naver_login':
              naverLogin(fromWV.redirect);
              break;
            case 'kakao_pay':
              try {
                await Navigation.push(props.componentId, {
                  component: {
                    name: 'Payment',
                    passProps: {
                      pg: 'kakaopay',
                      userCode: userCode,
                      data: data,
                    },
                  },
                });
              } catch (e) {
                console.error(e);
              }
              break;
            case 'logout':
              await logout();
              break;

            case 'download_template':
              const {downloadId, templateName} = data;
              await downloadTemplate(downloadId, templateName);

              break;
          }
        }}
        // onFileDownload={({nativeEvent: {downloadUrl}}) => {
        // const {config, fs} = RNFetchBlob;
        // let options = {
        //   path: fs.dirs.DocumentDir + '/document.docx',
        //   overwrite: true,
        // };
        // config(options)
        //   .fetch('GET', downloadUrl)
        //   .then(res => {
        //     console.log(res.data);
        //     Share.share({
        //       url: res.data,
        //     });
        //   });
        // }}
      />
    </SafeAreaView>
  );
}

export default App;
