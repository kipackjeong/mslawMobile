import React from 'react';
import {SafeAreaView} from 'react-native';
import WebView from 'react-native-webview';

function App(): JSX.Element {
  return (
    <SafeAreaView style={{flex: 1}}>
      <WebView
        style={{flex: 1}}
        source={{
          uri: 'https://allaw.kr/',
        }}
        // onMessage={async event => {
        //   const {message, redirect} = JSON.parse(event.nativeEvent.data);
        //   switch (message) {
        //     case 'kakao_login':
        //     // const token = await login();
        //     // console.log('token', token);
        //     // break;
        //   }
        // }}
        onFileDownload={({nativeEvent: {downloadUrl}}) => {
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
        }}
      />
    </SafeAreaView>
  );
}
export default App;
