import React, {useEffect} from 'react';
import {Navigation} from 'react-native-navigation';
import SplashScreen from 'react-native-splash-screen';
import WebView from 'react-native-webview';
import {SafeAreaView} from 'react-native';
// import {login} from '@react-native-seoul/kakao-login';

function App(props: any) {
  useEffect(() => {
    SplashScreen.hide();
  }, []);
  return (
    <SafeAreaView style={{flex: 1}}>
      <WebView
        style={{flex: 1}}
        source={{
          uri: 'https://allaw.kr/',
        }}
        onMessage={async event => {
          console.log('event.nativeEvent.data: ', event.nativeEvent.data);
          console.log(event.nativeEvent.data);
          console.log(event.nativeEvent);
          const {message, userCode, data} = JSON.parse(event.nativeEvent.data);
          console.log('message: ', message);
          switch (message) {
            case 'kakao_login':
              // const token = await login();
              // console.log('token', token);
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
