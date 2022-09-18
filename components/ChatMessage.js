import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  Pressable,
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
const ChatMessage = props => {
  // console.log('chat message rendering');
  const {
    messageId,
    text,
    senderUid,
    createdAt,
    isLiked,
    reply,
    image,
    isRead,
    conversationId,
  } = props.message;
  const receiverUid = props.receiverUid;
  const likeMessage = props.likeMessage;
  const unLikeMessage = props.unLikeMessage;
  const deleteMessage = props.deleteMessage;
  const replyMessage = props.replyMessage;

  const [modalToggle, setModalToggle] = useState(false);
  const [lastPress, setLastPress] = useState(0);
  const [imageUrl, setImageUrl] = useState(null);
  const [hasRead, setHasRead] = useState(false);

  useEffect(() => {
    // if(senderUid===receiver)
    let isMounted = true;
    const demo = async () => {
      if (auth().currentUser.uid !== senderUid) {
        //receiver
        //  handleNotification(message);

        const doc = await firestore()
          .collection('Messages')
          .doc(messageId)
          .update({isRead: true});

        // const doc=await firestore().collection('Conversations').doc(conversat)
        setHasRead(prevHasRead => true);

        //update the seen just now
      } else {
        // console.log('sender');
      }
    };
    demo();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const getImageUrl = async () => {
      try {
        if (image !== '') {
          //upload image
          const uri = image;

          const imageName = uri.substring(uri.lastIndexOf('/') + 1);
          const uploadUri =
            Platform.OS === 'ios' ? uri.replace('file://', '') : uri;

          const task = storage().ref(imageName).putFile(uploadUri);

          // set progress state
          task.on('state_changed', snapshot => {
            // setTransferred(
            //     Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 10000
            // );
          });

          await task;

          const filename = image.split('Pictures/')[1];

          const url = await storage()
            .ref('/' + filename)
            .getDownloadURL();

          setImageUrl(prevImageUrl => url);
        }
      } catch (err) {
        console.log(err);
      }
    };

    getImageUrl();
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

  const forwardMessage = async messageId => {
    // console.log('forward message ' + messageId);
  };
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
            <View
              style={{
                backgroundColor: 'black',
                width: 200,
                padding: 20,
                borderRadius: 12,
              }}>
              {senderUid === auth().currentUser.uid && (
                <TouchableOpacity
                  onPress={() => {
                    deleteMessage(messageId);
                    closeModal();
                  }}
                  style={{marginBottom: 5}}>
                  <Text>delete message </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => forwardMessage(messageId)}
                style={{marginBottom: 5}}>
                <Text>forward messsage</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  closeModal();

                  replyMessage(messageId, text);
                }}
                style={{marginBottom: 5}}>
                <Text>reply messsage</Text>
              </TouchableOpacity>

              {isLiked ? (
                <TouchableOpacity
                  onPress={() => {
                    unLikeMessage(messageId);
                    closeModal();
                  }}
                  style={{marginBottom: 5}}>
                  <Text>unlike messsage</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    likeMessage(messageId);
                    closeModal();
                  }}
                  style={{marginBottom: 5}}>
                  <Text>like messsage</Text>
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
          <View>
            <Text>{auth().currentUser.displayName}</Text>
            <Text styles={{color: 'blue'}}>{reply}</Text>
          </View>
        ) : (
          <></>
        )}
        {text && (
          <Text
            style={[
              styles.text,
              auth().currentUser.uid === senderUid
                ? styles.sentText
                : styles.receivedText,
            ]}>
            {text}
          </Text>
        )}
        {image !== '' ? (
          imageUrl ? (
            <FastImage
              style={{width: 200, height: 100}}
              source={{
                uri: imageUrl,
                cache: FastImage.cacheControl.immutable,
              }}
            />
          ) : (
            <Text>loading image...</Text>
          )
        ) : (
          <></>
        )}

        {/* <Video
          source={{
            uri: 'https://statusguide.com/anykreeg/2021/06/yt1s.com-goku-ultra-instinct-form-WhatsApp-status-video-_1080pFHR.mp4',
          }}
          style={{width: 200, height: 200}}
          paused={false}
          repeat={true}></Video> */}
        <View style={{flexDirection: 'row', alignSelf: 'flex-end'}}>
          <Text
            style={[
              styles.createdAt,
              auth().currentUser.uid === senderUid
                ? styles.sentCreatedAt
                : styles.receivedCreatedAt,
            ]}>
            {moment(createdAt?.seconds * 1000).format('HH:mm')}
          </Text>
          {hasRead ? (
            <DoubleCheck />
          ) : (
            <FeatherIcon style={styles.singleCheck} name="check" />
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
    maxWidth: 200,
    marginBottom: 30,
    // padding: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',

    // elevation: 1,
  },
  sent: {
    // borderWidth: 2,
    // borderColor: '#3E45DF',
    alignSelf: 'flex-end',
  },
  received: {
    //  backgroundColor: 'blue',
  },
  text: {
    fontSize: 16,
    borderRadius: 100,
    padding: 15,

    fontFamily: 'Inter-Semibold',
    textAlign: 'center',
    // elevation: 5,
  },
  sentText: {
    // borderWidth: 2,
    // borderColor: 'black',

    color: 'white',
    backgroundColor: '#5F6F94',
  },
  receivedText: {
    // borderWidth: 2,
    // borderColor: 'lightblue',
    backgroundColor: '#222831',
    color: 'white',
  },
  createdAt: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    marginRight: 5,
  },
  sentCreatedAt: {
    color: 'black',
  },
  receivedCreatedAt: {
    color: 'black',
  },
  singleCheck: {
    marginRight: 5,
    color: 'black',
  },
  heartIcon: {},
  sentHeartIcon: {
    color: '#F6416C',
  },
  receiverHeartIcon: {
    color: '#F6416C',
  },
});

export default memo(ChatMessage);
