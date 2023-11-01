import App from './App';
import {name as appName} from './app.json';
import {Navigation} from 'react-native-navigation';
import Payment from './src/Payment';

Navigation.registerComponent(appName, () => App);
Navigation.registerComponent('Payment', () => Payment);

Navigation.events().registerAppLaunchedListener(async () => {
  Navigation.setRoot({
    root: {
      stack: {
        children: [
          {
            component: {
              name: appName,
              options: {
                topBar: {
                  visible: false,
                  drawBehind: true,
                  animate: false,
                },
              },
            },
          },
        ],
      },
    },
  });
});
