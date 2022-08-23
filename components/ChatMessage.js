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

import Icon from 'react-native-vector-icons/AntDesign';
import Video from 'react-native-video';

import moment from 'moment';
const ChatMessage = props => {
  const {messageId, text, senderUid, createdAt, isLiked, reply, image} =
    props.message;

  const likeMessage = props.likeMessage;
  const unLikeMessage = props.unLikeMessage;
  const deleteMessage = props.deleteMessage;
  const replyMessage = props.replyMessage;

  const [modalToggle, setModalToggle] = useState(false);
  const [lastPress, setLastPress] = useState(0);
  const [imageUrl, setImageUrl] = useState(null);

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
    console.log('forward message ' + messageId);
  };
  const onPress = () => {
    var time = new Date().getTime();
    var delta = time - lastPress;
    const DOUBLE_PRESS_DELAY = 300;
    if (delta < DOUBLE_PRESS_DELAY) {
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
        {text ? <Text style={styles.text}>{text}</Text> : <></>}
        {image !== '' ? (
          imageUrl ? (
            <Image
              style={{width: 200, height: 100}}
              resizeMode="contain"
              source={{
                uri: imageUrl,
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

        <Text style={styles.createdAt}>
          {moment(createdAt?.seconds * 1000).format('HH:mm')}
        </Text>
        {isLiked ? <Icon name="heart" size={16} color="red"></Icon> : <></>}
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  box: {
    maxWidth: 200,
    marginBottom: 10,
    padding: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  sent: {
    backgroundColor: 'lightblue',
    alignSelf: 'flex-end',
  },
  received: {
    backgroundColor: 'lightgrey',
  },
  text: {
    color: 'black',
    fontSize: 16,
  },
  createdAt: {
    color: 'black',
    fontSize: 12,
    color: 'grey',
  },
});

export default ChatMessage;
