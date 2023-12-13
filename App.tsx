import React, {useEffect, useRef} from 'react';
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
import {KakaoProfile, getProfile, login} from '@react-native-seoul/kakao-login';
import RNFetchBlob, {RNFetchBlobConfig} from 'rn-fetch-blob';

function App(props: any) {
  const wvRef = useRef<WebView>(null);

  useEffect(() => {
    SplashScreen.hide();
  }, []);

  const signInWithKakao = async (): Promise<void> => {
    console.log('signInWithKakao');
    try {
      const token = await login();
      const profile: KakaoProfile = await getProfile();
      const message = {
        type: 'kakao_profile',
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        ...profile,
      };

      wvRef.current?.postMessage(JSON.stringify(message));
    } catch (error) {
      console.log(error);
      Alert.alert('카카오 로그인 실패');
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

  async function downloadTemplate(downloadId: string, templateName: string) {
    console.log('downloadTemplate');
    const downloadUrl = `https://api.allaw.kr/inquiry/${downloadId}/download`;

    //https://www.sortedpoint.com/how-to-download-file-react-native-app-android-ios/
    if (Platform.OS === 'android') {
      console.log('isAndroid');
      // android
      const granted = await getDownloadPermissionAndroid();
      console.log('granted: ', granted);
      if (granted) {
        const res = await downloadFile(downloadUrl, templateName);
        console.log('res:', res);
      }
    } else {
      // ios
      const res = await downloadFile(downloadUrl, templateName);
      console.log('res:', res);

      if (res) {
        RNFetchBlob.ios.previewDocument(res.path());
      }
    }
  }

  const getDownloadPermissionAndroid = async () => {
    try {
      const check = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      console.log('check', check);
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
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
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
    console.log('downloadFile');
    console.log('RNFetchBlob', RNFetchBlob);
    const {fs} = RNFetchBlob;
    const cacheDir = fs.dirs.DownloadDir;

    // Generate a unique filename for the downloaded image
    const filePath = `${cacheDir}/${filename}`;

    try {
      // Download the file and save it to the cache directory
      const configOptions: RNFetchBlobConfig = Platform.select({
        ios: {
          fileCache: true,
          path: filePath,
          appendExt: 'hwp',
        },
        android: {
          fileCache: true,
          path: filePath,
          appendExt: filename?.split('.').pop(),
          addAndroidDownloads: {
            // Related to the Android only
            useDownloadManager: true,
            notification: true,
            path: filePath,
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
          const {message, userCode, data} = JSON.parse(event.nativeEvent.data);
          switch (message) {
            case 'kakao_login':
              signInWithKakao();
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
