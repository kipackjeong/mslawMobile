import React from 'react';
// import type {StackScreenProps} from '@react-navigation/stack';
// import type {RootStackParamList} from '../App';
import IMP from 'iamport-react-native';
import Loading from './Loading';
// import {SafeAreaView} from 'react-native';

function getBoolean(value: string | boolean | undefined) {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value === 'true';
  }
  return undefined;
}

function Payment({userCode, data}: any) {
  /* 가맹점 식별코드, 결제 데이터 추출 */
  //   const userCode = route.params?.userCode;
  //   const data = route.params?.data;
  console.log('userCode: ', userCode);
  console.log('data: ', data);

  /* [필수입력] 결제 후 실행될 콜백 함수 입력 */
  function callback(response: any) {
    console.log('response: ', response);
    const isSuccessed = getIsSuccessed(response);
    if (isSuccessed) {
      // 결제 성공한 경우, 리디렉션 위해 홈으로 이동한다
      //   const params = {
      //     response,
      //     type: 'payment',
      //   };
      //   navigation.replace('Home', params);
    } else {
      // 결제 실패한 경우, 본래 페이지로 돌아간다
      //   navigation.goBack();
    }
  }

  function getIsSuccessed(response: any) {
    const {imp_success, success, error_code, code} = response;
    return (
      getBoolean(imp_success) ??
      getBoolean(success) ??
      (error_code == null && code == null)
    );
  }
  userCode = 'imp37405014';
  return (
    <IMP.Payment
      userCode={userCode as string}
      loading={<Loading />}
      data={{
        pg: 'kakaopay',
        ...data,
        app_scheme: 'mslawMobile',
        // m_redirect_url: 'mslawMobile:' + data.redirect_url,
      }}
      callback={callback}
    />
  );
}

export default Payment;

/* [필수입력] 결제에 필요한 데이터를 입력합니다. */
//   const data = {
//     pg: 'kakaopay',
//     pay_method: 'card',
//     name: '',
//     merchant_uid: `mid_${new Date().getTime()}`,
//     amount: '39000',
//     buyer_name: '홍길동',
//     buyer_tel: '',
//     buyer_email: 'example@naver.com',
//     buyer_addr: '',
//     buyer_postcode: '',
//     app_scheme: 'mslawMobile',
//     escrow: false,
//   };
