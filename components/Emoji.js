import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {memo} from 'react';

const Emoji = ({item, index, setText}) => {
  return (
    <TouchableOpacity
      onPress={() => setText(prevState => prevState + item)}
      key={index}
      style={styles.emoji}>
      <Text
        style={{
          color: 'white',
          fontSize: 38,
        }}>
        {item}
      </Text>
    </TouchableOpacity>
  );
};

export default memo(Emoji);

const styles = StyleSheet.create({
  emoji: {marginRight: 9, marginBottom: 20},
});
