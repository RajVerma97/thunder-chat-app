import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  Pressable,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/AntDesign';

import moment from 'moment';
const ChatMessage = props => {
  const {messageId, text, senderUid, createdAt, isLiked, reply} = props.message;

  const likeMessage = props.likeMessage;
  const unLikeMessage = props.unLikeMessage;
  const deleteMessage = props.deleteMessage;
  const replyMessage = props.replyMessage;

  const [modalToggle, setModalToggle] = useState(false);
  const [lastPress, setLastPress] = useState(0);


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
    const DOUBLE_PRESS_DELAY = 200;
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
        <Text style={styles.text}>{text}</Text>

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
