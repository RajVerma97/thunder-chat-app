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
import FastImage from 'react-native-fast-image';
import {memo} from 'react';
import moment from 'moment';

const ChatMessage = props => {
  console.log('chat message rendering');
  const {messageId, text, senderUid, createdAt, isLiked, reply, image, isRead} =
    props.message;
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
      try {
        console.log(`msg is ${text}`);
        console.log(`sender Uid of this message is ${senderUid}`);
        console.log(`receiver Uid of  this message is ${receiverUid}`);
        if (senderUid == receiverUid) {
          console.log(`read`);
        }
        // if (isMounted) {
        //   if (senderUid === receiverUid) {
        //     setHasRead(prevHasRead => true);
        //   }
        // }
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
        {text ? <Text style={styles.text}>{text}</Text> : <></>}
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

        <Text style={styles.createdAt}>
          {moment(createdAt?.seconds * 1000).format('HH:mm')}
        </Text>
        {hasRead ? <Text> read</Text> : <Text> not read</Text>}

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

export default memo(ChatMessage);
