import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  ActivityIndicator,
  Linking,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Video from 'react-native-video';
import FastImage from 'react-native-fast-image';
import {memo} from 'react';
import moment from 'moment';
import {set} from 'react-native-reanimated';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import FeatherIcon from 'react-native-vector-icons/Feather';
import DoubleCheck from './DoubleCheck';
import Hyperlink from 'react-native-hyperlink';
// import RNFetchBlob from 'react-native-fetch-blob';
import PushNotification from 'react-native-push-notification';

// import * as Progress from 'react-native-progress';
import ProgressBar from 'react-native-progress/Bar';
import ProgressCircle from 'react-native-progress/Circle';
import ProgressCircleSnail from 'react-native-progress/CircleSnail';
import LottieView from 'lottie-react-native';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';

const ChatMessage = props => {
  console.log('chat message rendering');
  const {
    messageId,
    text,
    senderUid,
    createdAt,
    isLiked,
    reply,
    image,
    isRead,
    video,
    conversationId,
  } = props.message;
  // console.log('frrom chat message screeen');

  const receiverUid = props.receiverUid;
  const likeMessage = props.likeMessage;
  const unLikeMessage = props.unLikeMessage;
  const deleteMessage = props.deleteMessage;
  const replyMessage = props.replyMessage;
  const receiver = props.receiver;

  const [modalToggle, setModalToggle] = useState(false);
  const [lastPress, setLastPress] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [hasRead, setHasRead] = useState(false);
  const [transferred, setTransferred] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // if(senderUid===receiver)
    let isMounted = true;
    const demo = async () => {
      try {
        if (auth().currentUser.uid !== senderUid) {
          //receiver

          handleNotification(text, image, video);

          const doc = await firestore()
            .collection('Messages')
            .doc(messageId)
            .update({isRead: true});

          setHasRead(prevHasRead => true);
        }
      } catch (err) {
        console.log(err);
      }
    };
    demo();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const getImageUrl = async () => {
      try {
        if (isMounted) {
          if (image !== '') {
            //upload image
            // setUploadingImage(true);
            setUploading(true);

            const uri = image;

            const imageName = uri.substring(uri.lastIndexOf('/') + 1);
            const uploadUri =
              Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
            // setUploadingImage(true);

            setTransferred(0);

            const task = storage().ref(imageName).putFile(uploadUri);

            // set progress state
            task.on('state_changed', snapshot => {
              setTransferred(
                Math.round(snapshot.bytesTransferred / snapshot.totalBytes) *
                  10000,
              );
            });

            await task;
            setUploading(false);
            // setUploadingImage(false);

            const filename = image.split('Pictures/')[1];

            const url = await storage()
              .ref('/' + filename)
              .getDownloadURL();

            setImageUrl(prevImageUrl => url);
          }
        }
      } catch (err) {
        console.log(err);
      }
    };

    getImageUrl();
    return () => {
      isMounted = false;
    };
  }, []);
  useEffect(() => {
    let isMounted = true;
    const getVideoUrl = async () => {
      console.log('get video url');
      try {
        if (isMounted) {
          if (video !== '') {
            //upload video
            setUploading(true);
            const uri = video;

            const videoName = uri.substring(uri.lastIndexOf('/') + 1);
            console.log('videoName ' + videoName);
            const uploadUri =
              Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
            setTransferred(0);

            const task = storage().ref(videoName).putFile(uploadUri);

            // set progress state
            task.on('state_changed', snapshot => {
              setTransferred(
                Math.round(snapshot.bytesTransferred / snapshot.totalBytes) *
                  10000,
              );
            });

            await task;
            setUploading(false);
            console.log('video is ' + video);
            // setLoading(true);

            const filename = video.split('picker/')[1];
            console.log('filename ' + filename);

            const url = await storage()
              .ref('/' + filename)
              .getDownloadURL();
            console.log('url ' + url);
            // setLoading(false);

            setVideoUrl(prevVideoUrl => url);
          }
        }
      } catch (err) {
        console.log(err);
      }
    };

    getVideoUrl();
    return () => {
      isMounted = false;
    };
  }, []);

  const openModal = () => {
    requestAnimationFrame(() => {
      setModalToggle(true);
    });
  };

  const closeModal = () => {
    requestAnimationFrame(() => {
      setModalToggle(false);
    });
  };

  // const forwardMessage = async messageId => {
  //   // console.log('forward message ' + messageId);
  // };
  const onPress = () => {
    var time = new Date().getTime();
    var delta = time - lastPress;
    const DOUBLE_PRESS_DELAY = 500;
    if (delta < DOUBLE_PRESS_DELAY) {
      // console.log('double tap happened');
      if (isLiked) {
        unLikeMessage(messageId);
      } else {
        likeMessage(messageId);
      }
    }
    setLastPress(time);
  };

  return (
    <View>
      <Modal visible={modalToggle} animationType={'fade'} transparent={true}>
        <TouchableOpacity
          onPress={closeModal}
          activeOpacity={1}
          style={{
            flex: 1,
            // backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <TouchableWithoutFeedback>
            <View style={styles.modalWrapper}>
              {senderUid === auth().currentUser.uid && (
                <TouchableOpacity
                  onPress={() => {
                    deleteMessage(messageId);
                    closeModal();
                  }}
                  style={styles.modalWrapper__item}>
                  <Text style={styles.modalWrapper__item__text}>
                    delete message
                  </Text>
                </TouchableOpacity>
              )}

              {text !== '' ? (
                <TouchableOpacity
                  onPress={() => {
                    closeModal();

                    replyMessage(messageId, text);
                  }}
                  style={styles.modalWrapper__item}>
                  <Text style={styles.modalWrapper__item__text}>
                    reply messsage
                  </Text>
                </TouchableOpacity>
              ) : null}

              {isLiked ? (
                <TouchableOpacity
                  onPress={() => {
                    unLikeMessage(messageId);
                    closeModal();
                  }}
                  style={styles.modalWrapper__item}>
                  <Text style={styles.modalWrapper__item__text}>
                    unlike messsage
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    likeMessage(messageId);
                    closeModal();
                  }}
                  style={styles.modalWrapper__item}>
                  <Text style={styles.modalWrapper__item__text}>
                    like messsage
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
      <TouchableOpacity
        onLongPress={openModal}
        onPress={onPress}
        style={[
          styles.box,
          auth().currentUser.uid === senderUid ? styles.sent : styles.received,
        ]}>
        {reply ? (
          <View
            style={{
              fontFamily: 'Inter-Semibold',
              textAlign: 'center',
              padding: 10,
              borderRadius: 8,
            }}>
            <Text
              style={{
                color: 'black',
                backgroundColor: '#5F6F94',
                fontSize: 16,
                borderRadius: 100,
                padding: 15,
                color: 'white',
              }}>
              {reply}
            </Text>
          </View>
        ) : (
          <></>
        )}
        {text ? (
          <Hyperlink linkStyle={{color: 'blue'}} onPress={Linking.openURL}>
            <Text
              style={[
                styles.text,
                auth().currentUser.uid === senderUid
                  ? styles.sentText
                  : styles.receivedText,
                reply ? {backgroundColor: 'darkgrey'} : null,
              ]}>
              {text}
            </Text>
          </Hyperlink>
        ) : (
          <></>
        )}

        {image !== '' &&
          (imageUrl ? (
            <FastImage
              style={[
                styles.image,
                auth().currentUser.uid === senderUid
                  ? styles.sentImage
                  : styles.receivedImage,
              ]}
              source={{
                uri: imageUrl,
                cache: FastImage.cacheControl.web,
              }}
            />
          ) : (
            <></>
          ))}

        {uploading && image ? (
          <View style={styles.imageProgressContainer}>
            <LottieView
              style={{width: 100, height: 100}}
              source={require('../assets/lottie/loadingImage.json')}
              loop
              autoPlay
            />
          </View>
        ) : null}

        {video !== '' ? (
          videoUrl ? (
            <Video
              source={{
                uri: videoUrl,
              }}
              style={styles.videoPlayer}
              paused={false}
              controls={true}
              repeat={true}
            />
          ) : (
            <></>
          )
        ) : (
          <></>
        )}
        {uploading && video ? (
          <View style={styles.videoProgressContainer}>
            <LottieView
              style={{width: 100, height: 100}}
              source={require('../assets/lottie/loadingVideo.json')}
              loop
              autoPlay
            />
          </View>
        ) : null}

        <View
          style={{flexDirection: 'row', alignSelf: 'flex-end', marginTop: 5}}>
          {createdAt && (
            <Text
              style={[
                styles.createdAt,
                auth().currentUser.uid === senderUid
                  ? styles.sentCreatedAt
                  : styles.receivedCreatedAt,
              ]}>
              {moment(createdAt?.seconds * 1000).format('HH:mm')}
            </Text>
          )}

          {hasRead ? (
            <DoubleCheck />
          ) : (
            auth().currentUser.uid === senderUid && (
              <FeatherIcon style={styles.singleCheck} name="check" />
            )
          )}

          {isLiked && (
            <AntDesign
              style={[
                styles.heartIcon,
                auth().currentUser.uid === senderUid
                  ? styles.sentHeartIcon
                  : styles.receiverHeartIcon,
              ]}
              name="heart"
              size={16}
            />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  box: {
    maxWidth: 250,
    marginBottom: 18,
    padding: 12,
    borderRadius: 24,
    alignSelf: 'flex-start',

    // elevation: 1,
  },
  sent: {
    // borderWidth: 2,
    // borderColor: '#3E45DF',
    alignSelf: 'flex-end',
    backgroundColor: '#247BA0',
  },
  received: {
    backgroundColor: '#E2E2E2',
  },
  text: {
    fontSize: 16,
    borderRadius: 100,
    // padding: 12,

    fontFamily: 'Inter-Semibold',
    textAlign: 'center',
    // marginBottom: 5,
    // elevation: 5,
  },
  sentText: {
    // borderWidth: 2,
    // borderColor: 'black',

    color: '#FFF7E9',
    // backgroundColor: '#5F6F94',
  },
  receivedText: {
    // borderWidth: 2,
    // borderColor: 'lightblue',
    // backgroundColor: '#222831',
    color: '#110B11',
  },
  createdAt: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    marginRight: 5,
  },
  sentCreatedAt: {
    color: '#DBE2EF',
  },
  receivedCreatedAt: {
    color: 'black',
  },
  singleCheck: {
    marginRight: 5,
    color: '#DBE2EF',
  },
  heartIcon: {},
  sentHeartIcon: {
    color: '#F6416C',
  },
  receiverHeartIcon: {
    color: '#F6416C',
  },
  image: {
    width: 160,
    height: 250,
    borderWidth: 4,
    borderRadius: 12,
    // elevation: 5,
  },
  sentImage: {
    borderColor: 'white',
  },
  receivedImage: {
    borderColor: 'white',
  },
  imageProgressContainer: {
    width: 160,
    height: 250,
    borderWidth: 4,
    borderRadius: 12,
    // elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'white',
    borderColor: 'white',
  },
  videoProgressContainer: {
    width: 200,
    height: 300,
    borderWidth: 4,
    borderRadius: 12,
    // elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'white',
  },
  videoPlayer: {
    width: 200,
    height: 300,
    borderWidth: 4,
    borderRadius: 12,
    elevation: 5,
  },
  modalWrapper: {
    backgroundColor: 'black',
    padding: 25,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalWrapper__item: {
    marginBottom: 10,
  },
  modalWrapper__item__text: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Inter-Regular',
    textTransform: 'capitalize',
  },
});

export default memo(ChatMessage);
