import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  TouchableOpacity,
  Image,
  Flatlist,
  Dimensions,
  Button,
} from 'react-native';
import React, {
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
  useContext,
  memo,
} from 'react';
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {FlatList, PanGestureHandler} from 'react-native-gesture-handler';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import FastImage from 'react-native-fast-image';
import {DarkModeContext} from '../Context/DarkModeContext';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 50;
import firestore from '@react-native-firebase/firestore';

const WallpaperBottomSheet = React.forwardRef(
  (
    {backgroundWallpaper, setBackgroundWallpaper, changeBackgroundWallpaper},
    ref,
  ) => {
    console.log('media bottomsheet rendering');
    const {darkMode, setDarkMode, toggleDarkMode} = useContext(DarkModeContext);

    var [wallpapers, setWallpapers] = useState([
      require('../assets/images/wallpaper-1.jpg'),
      require('../assets/images/wallpaper-2.jpg'),
      require('../assets/images/wallpaper-3.jpg'),
      require('../assets/images/wallpaper-4.jpg'),
      require('../assets/images/wallpaper-5.jpg'),
      require('../assets/images/wallpaper-6.jpg'),
      require('../assets/images/wallpaper-7.jpg'),
      require('../assets/images/wallpaper-8.jpg'),
    ]);

    const translateY = useSharedValue(0);
    const active = useSharedValue(false);
    const context = useSharedValue({y: 0});

    const scrollTo = useCallback(destination => {
      'worklet';
      active.value = destination !== 0;

      translateY.value = withSpring(destination, {
        damping: 80,
        overshootClamping: true,
        restDisplacementThreshold: 0.1,
        restSpeedThreshold: 0.1,
        stiffness: 500,
      });
    }, []);
    const isActive = useCallback(() => {
      return active.value;
    }, [active.value]);
    useImperativeHandle(ref, () => ({scrollTo, isActive}), [scrollTo]);
    const gesture = Gesture.Pan()
      .onStart(() => {
        context.value = {y: translateY.value};
      })
      .onUpdate(event => {
        translateY.value = event.translationY + context.value.y;
        translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y);
      })
      .onEnd(() => {
        if (translateY.value > -SCREEN_HEIGHT / 1.5) {
          scrollTo(0);
        } else if (translateY.value < -SCREEN_HEIGHT / 2) {
          scrollTo(MAX_TRANSLATE_Y);
        }
      });

    const rBottomSheetStyle = useAnimatedStyle(() => {
      return {
        transform: [{translateY: translateY.value}],
      };
    });

    return (
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            styles.bottomSheetContainer,
            rBottomSheetStyle,
            darkMode ? {backgroundColor: '#EAEAEA'} : null,
          ]}>
          <View style={styles.line}></View>
          <View>
            {/* <Text style={styles.title}>Change Wallpaper</Text> */}
            {backgroundWallpaper ? (
              <TouchableOpacity
                onPress={() => changeBackgroundWallpaper(null)}
                style={styles.removeWallpaperBtn}>
                <Text style={styles.removeWallpaperBtn__text}>
                  remove wallpaper
                </Text>
              </TouchableOpacity>
            ) : null}

            <View
              style={{
                padding: 20,
              }}>
              <FlatList
                data={wallpapers}
                renderItem={({item, index}) => {
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
                }}
                numColumns={3}
                keyExtractor={(item, index) => index.toString()}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
              />
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    );
  },
);

export default memo(WallpaperBottomSheet);

const styles = StyleSheet.create({
  bottomSheetContainer: {
    height: SCREEN_HEIGHT,
    width: '100%',
    backgroundColor: '#EEEEEE',
    position: 'absolute',
    top: SCREEN_HEIGHT,
    zIndex: 100,
    borderRadius: 25,
  },
  line: {
    width: 75,
    height: 3,
    backgroundColor: 'grey',
    alignSelf: 'center',
    marginVertical: 20,
    borderRadius: 2,
  },
  title: {
    color: 'black',
    fontSize: 22,
    alignSelf: 'center',
    fontFamily: 'Inter-Medium',
    marginBottom: 20,
  },
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

  removeWallpaperBtn: {
    // width: 180,
    // height: 70,
    backgroundColor: '#1E2022',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 10,
    elevation: 5,
  },
  removeWallpaperBtn__text: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    color: 'white',
    textTransform: 'capitalize',
  },
});
