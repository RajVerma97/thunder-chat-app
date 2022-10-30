import {StyleSheet, Text, Image, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {memo} from 'react';

const Wallpaper = ({item, index, backgroundWallpaper,changeBackgroundWallpaper}) => {
  return (
    <TouchableOpacity
      onPress={() => {
        changeBackgroundWallpaper(item);
      }}
      style={[
        styles.item,
        item === backgroundWallpaper
          ? styles.selectedBackgroundWallpaper
          : null,
      ]}
      key={index}>
      <Image style={styles.item__image} source={item} />
    </TouchableOpacity>
  );
};

export default memo(Wallpaper);

const styles = StyleSheet.create({
  item: {
    marginRight: 18,
    marginBottom: 16,
    elevation: 5,
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  item__image: {
    width: 85,
    height: 130,
    resizeMode: 'cover',
  },

  selectedBackgroundWallpaper: {
    backgroundColor: 'green',
  },
});
