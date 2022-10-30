import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import FeatherIcon from 'react-native-vector-icons/Feather';
import {memo} from 'react';

const DoubleCheck = () => {
  return (
    <View style={styles.doubleCheck}>
      <FeatherIcon
        name="check"
        color="black"
        style={styles.doubleCheck__first}
      />
      <FeatherIcon
        name="check"
        color="black"
        style={styles.doubleCheck__second}
      />
    </View>
  );
};

export default memo(DoubleCheck);

const styles = StyleSheet.create({
  doubleCheck: {
    // borderColor: 'red',
    // borderWidth: 5,
  },

  doubleCheck__second: {
    position: 'absolute',
    top: 3,
  },
});
