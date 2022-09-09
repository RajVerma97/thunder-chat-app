import {
  View,
  Text,
  Button,
  Image,
  SafeAreaView,
  StyleSheet,
  useContext,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {useState, useRef} from 'react';
import {LoginContext} from '../Context/LoginContext';
import {Dimensions} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import {onChange} from 'react-native-reanimated';

var DEVICE_WIDTH = Dimensions.get('window').width;
var DEVICE_HEIGHT = Dimensions.get('window').height;

var colors = {
  darkBlue: '#222831',
  blue: '#3E45DF',
  grey: '#F1F1F1',
  white: '#FFFFFF',
  red: '#E30928',
  pink: '#F6416C',
};

var images = [
  {
    image: require('../assets/images/chatting.png'),
    title: 'thunder chat',
  },
  {
    image: require('../assets/images/encryption.png'),
    title: 'encrypted',
  },
  {
    image: require('../assets/images/security.png'),
    title: 'secure',
  },
];

const SplashScreen = () => {
  const navigation = useNavigation();
  const scrollRef = useRef();

  const [activeImage, setActiveImage] = useState(0);
  // useEffect(() => {
  //   setInterval(() => {
  //     setActiveImage(prevActiveImage => prevActiveImage + 1);
  //   }, 3000);
  // }, []);

  // useEffect(() => {
  //   scrollRef.current.scrollTo({
  //     animated: true,
  //     y: 0,
  //     x: 250 * activeImage,
  //   });
  // }, [activeImage]);

  const onChange = nativeEvent => {
    //width of the view size
    if (nativeEvent) {
      const slide = Math.ceil(
        nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width,
      );
      if (slide != activeImage) {
        setActiveImage(slide);
      }
    }
    // const viewSize = event.nativeEvent.layoutMeasurement.width;
    // const contentOffSet = event.nativeEvent.contentOffset.x;
    // const selectedIndex = Math.floor(contentOffSet / viewSize);
    // setActiveImage(prev => selectedIndex);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <ScrollView
          style={styles.carousel}
          horizontal
          pagingEnabled
          ref={scrollRef}
          // onMomentumScrollEnd={setSelectedIndex}>
          onScroll={({nativeEvent}) => onChange(nativeEvent)}>
          {images.map((e, index) => {
            return (
              <View style={styles.slide} key={index}>
                <Image style={styles.slide__image} source={e.image} />
                <Text style={styles.slide__text}>{e.title}</Text>
              </View>
            );
          })}
        </ScrollView>
        <View style={styles.dotsContainer}>
          {images.map((e, index) => {
            return (
              <View
                style={[
                  styles.dot,
                  index === activeImage ? styles.activeDot : styles.unActiveDot,
                ]}
                key={index}></View>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => navigation.navigate('PhoneNumberScreen')}>
          <Text style={styles.loginBtn__text}>Sign in</Text>
          <FeatherIcon style={styles.loginBtn__icon} name="log-in" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBlue,
    // paddingHorizontal: 20,
    // paddingTop: 40,
    padding: 10,

    justifyContent: 'center',
    alignItems: 'center',
  },
  wrapper: {
    width: '100%',
    height: '85%',
    backgroundColor: colors.white,
    // borderWidth: 5,
    // borderColor: 'red',
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,

    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
    padding: 20,
    alignItems: 'center',
  },

  carousel: {
    paddingTop: 30,
  },
  slide: {
    alignItems: 'center',
  },
  slide__image: {
    resizeMode: 'stretch',
    width: 300,
    height: 260,
  },
  slide__text: {
    color: colors.darkBlue,
    fontWeight: '500',
    fontFamily: 'Inter-Regular',
    fontSize: 30,
    textTransform: 'capitalize',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 100,
    marginRight: 15,
  },

  activeDot: {
    backgroundColor: colors.darkBlue,
  },

  unActiveDot: {
    backgroundColor: '#CACACA',
  },

  loginBtn: {
    width: 180,
    height: 70,
    backgroundColor: colors.blue,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 50,
    marginTop: 60,
    marginBottom: 30,
  },
  loginBtn__text: {
    fontWeight: '700',
    fontFamily: 'Inter-bold',
    fontSize: 22,
    color: colors.white,
  },
  loginBtn__icon: {
    fontSize: 22,
    color: colors.white,
  },
});

export default SplashScreen;
