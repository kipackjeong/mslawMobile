import React, {useEffect, useRef} from 'react';
import {Navigation} from 'react-native-navigation';
import SplashScreen from 'react-native-splash-screen';
import WebView from 'react-native-webview';
import {Alert, BackHandler, SafeAreaView} from 'react-native';
import {KakaoProfile, getProfile, login} from '@react-native-seoul/kakao-login';

function App(props: any) {
  const wvRef = useRef<WebView>(null);

  useEffect(() => {
    SplashScreen.hide();
  }, []);

  const signInWithKakao = async (): Promise<void> => {
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
      wvRef.current?.clearCache?.(true);
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
              } catch (e) {}
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
