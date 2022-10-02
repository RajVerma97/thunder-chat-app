import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  TouchableOpacity,
  Image,
  Flatlist,
  Dimensions,
} from 'react-native';
import React, {
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
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
import DocumentPicker from 'react-native-document-picker';
import ImagePicker from 'react-native-image-crop-picker';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
import storage from '@react-native-firebase/storage';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 50;

import FeatherIcon from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Octicons from 'react-native-vector-icons/Octicons';

const MediaBottomSheet = React.forwardRef(
  ({sender, conversationId, messages, setMessages}, ref) => {
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

    const uploadImage = async pickedImagePath => {
      console.log('uploading image ');
      const uri = pickedImagePath;

      const filename = uri.substring(uri.lastIndexOf('/') + 1);
      const uploadUri =
        Platform.OS === 'ios' ? uri.replace('file://', '') : uri;

      const task = storage().ref(filename).putFile(uploadUri);
      // set progress state
      task.on('state_changed', snapshot => {
        // setTransferred(
        //     Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 10000
        // );
      });
      try {
        await task;
      } catch (e) {
        console.error(e);
      }
      // setImage(null);
    };

    const uploadVideo = async pickedVideoPath => {
      console.log('uploading video ');
      const uri = pickedVideoPath;

      const filename = uri.substring(uri.lastIndexOf('/') + 1);
      const uploadUri =
        Platform.OS === 'ios' ? uri.replace('file://', '') : uri;

      const task = storage().ref(filename).putFile(uploadUri);
      // set progress state
      task.on('state_changed', snapshot => {
        // setTransferred(
        //     Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 10000
        // );
      });
      try {
        await task;
      } catch (e) {
        console.error(e);
      }
      // setImage(null);
    };

    const selectImage = () => {
      console.log('select image');
      ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
      })
        .then(response => {
          const pickedImage = response;
          const pickedImagePath = response.path;
          console.log('picked image is');
          console.log(pickedImagePath);

          // uploadImage(pickedImagePath);

          sendImage(pickedImagePath);
          // closeCameraRollModal();
          // setImage(pickedImagePath);
        })
        .catch(err => {
          console.log(err);
        });
    };
    const sendImage = useCallback(async clickedImagePath => {
      try {
        if (clickedImagePath) {
          const message = {
            image: clickedImagePath,

            senderUid: sender.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            conversationId: conversationId,
            isLiked: false,
            isRead: false,
            reply: '',
          };

          const response = await firestore()
            .collection('Messages')
            .add(message);
          let messageId = response.id;
          const docRef = await firestore()
            .collection('Messages')
            .doc(messageId);
          const result = await docRef.update({messageId: messageId});
          const myDoc = await docRef.get();
          const updatedMsg = myDoc._data;

          setMessages(prevMessages => [...prevMessages, updatedMsg]);

          // setClickedImage(prevClickedImage => null);
        }
      } catch (err) {
        console.log(err);
      }
    }, []);
    const selectVideo = () => {
      console.log('select video');
      ImagePicker.openPicker({
        mediaType: 'video',
      })
        .then(video => {
          const pickedVideoPath = video.path;
          console.log(pickedVideoPath);
          // uploadVideo(pickedVideoPath);
          sendVideo(pickedVideoPath);
          // closeCameraRollModal();
          // setImage(pickedImagePath);
        })
        .catch(err => {
          console.log(err);
        });
    };
    const sendVideo = useCallback(async pickedVideoPath => {
      try {
        if (pickedVideoPath) {
          const message = {
            video: pickedVideoPath,
            senderUid: sender.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            conversationId: conversationId,
            isLiked: false,
            isRead: false,
            reply: '',
          };

          const response = await firestore()
            .collection('Messages')
            .add(message);
          let messageId = response.id;
          const docRef = await firestore()
            .collection('Messages')
            .doc(messageId);
          const result = await docRef.update({messageId: messageId});
          const myDoc = await docRef.get();
          const updatedMsg = myDoc._data;

          setMessages(prevMessages => [...prevMessages, updatedMsg]);

          // setClickedImage(prevClickedImage => null);
        }
      } catch (err) {
        console.log(err);
      }
    }, []);
    const selectDocument = async () => {
      try {
        console.log('select document');

        const res = await DocumentPicker.pickSingle({
          type: [DocumentPicker.types.pdf],
        });
        const pickedDocumentPath = res.uri;
        
        // var unc = Platform.OS == 'ios' ? decodeURIComponent(res.uri) : res.uri;
        // console.log(unc);
        // uploadDocument(pickedDocumentPath);

        // sendDocument(pickedDocumentPath);

        // setDoc(res);
      } catch (err) {
        if (DocumentPicker.isCancel(err)) {
          console.log('cancelled doc picker');
        } else {
          throw err;
        }
      }
    };
    const sendDocument = useCallback(async pickedDocumentPath => {
      try {
        if (pickedDocumentPath) {
          const message = {
            document: pickedDocumentPath,
            senderUid: sender.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            conversationId: conversationId,
            isLiked: false,
            isRead: false,
            reply: '',
          };

          const response = await firestore()
            .collection('Messages')
            .add(message);
          let messageId = response.id;
          const docRef = await firestore()
            .collection('Messages')
            .doc(messageId);
          const result = await docRef.update({messageId: messageId});
          const myDoc = await docRef.get();
          const updatedMsg = myDoc._data;

          setMessages(prevMessages => [...prevMessages, updatedMsg]);

          // setClickedImage(prevClickedImage => null);
        }
      } catch (err) {
        console.log(err);
      }
    }, []);
    const uploadDocument = async pickedDocumentPath => {
      console.log('uploading document ');
      const uri = pickedDocumentPath;

      const filename = uri.substring(uri.lastIndexOf('/') + 1);
      const uploadUri =
        Platform.OS === 'ios' ? uri.replace('file://', '') : uri;

      const task = storage().ref(filename).putFile(uploadUri);
      // set progress state
      task.on('state_changed', snapshot => {
        // setTransferred(
        //     Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 10000
        // );
      });
      try {
        await task;
      } catch (e) {
        console.error(e);
      }
      // setImage(null);
    };

    return (
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.bottomSheetContainer, rBottomSheetStyle]}>
          <View style={styles.line}></View>
          <View style={styles.mediaContainer}>
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.media}
                onPress={() => {
                  selectImage();
                  scrollTo(0);
                }}>
                <AntDesign
                  style={styles.media__icon}
                  name="picture"
                  size={30}
                  color="black"
                />
              </TouchableOpacity>
              <Text style={styles.media__text}>image</Text>
            </View>
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.media}
                onPress={() => {
                  selectVideo();
                  scrollTo(0);
                }}>
                <Octicons
                  style={styles.media__icon}
                  name="video"
                  size={30}
                  color="black"
                />
              </TouchableOpacity>
              <Text style={styles.media__text}>video</Text>
            </View>
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.media}
                onPress={() => {
                  selectDocument();
                  scrollTo(0);
                }}>
                <Ionicons
                  style={styles.media__icon}
                  name="document-text-outline"
                  size={30}
                  color="black"
                />
              </TouchableOpacity>
              <Text style={styles.media__text}>document</Text>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    );
  },
);

export default MediaBottomSheet;

const styles = StyleSheet.create({
  bottomSheetContainer: {
    height: SCREEN_HEIGHT,
    width: '100%',
    backgroundColor: 'white',
    position: 'absolute',
    top: SCREEN_HEIGHT,
    zIndex: 1000,
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
  mediaContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  card: {
    alignItems: 'center',
  },
  media: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    // padding: 10,
  },
  media__icon: {
    fontSize: 40,
    color: 'black',
  },
  media__text: {
    marginTop: 10,
    color: 'grey',
    fontSize: 16,
    fontFamily: 'Inter-Semibold',
    textTransform: 'capitalize',
    marginTop: 14,
  },
});
