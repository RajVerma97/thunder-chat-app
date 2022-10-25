import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {memo} from 'react';

const Emoji = ({item, index,setText}) => {
  return (
    <TouchableOpacity
      onPress={() => setText(prevState => prevState + item)}
      key={index}
      style={{marginRight: 6, marginBottom: 26}}>
      <Text
        style={{
          color: 'red',
          fontSize: 40,
        }}>
        {item}
      </Text>
    </TouchableOpacity>
  );
};

export default memo(Emoji);

const styles = StyleSheet.create({});
