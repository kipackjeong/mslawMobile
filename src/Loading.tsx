import React from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';

export function Loading() {
  const {container} = styles;
  return (
    <View style={container}>
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Loading;
