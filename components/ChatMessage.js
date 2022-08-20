import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/AntDesign';

import moment from 'moment';
const ChatMessage = props => {
  const {messageId, text, senderUid, createdAt} = props.message;
  let messages = props.messages;
  const likeMessage = props.likeMessage;
  let setMessages = props.setMessages;
  const [modalToggle, setModalToggle] = useState(false);
  // const [isLiked, setIsLiked] = useState(true);

  const openModal = () => {
    // setMessageId(messageId);
    requestAnimationFrame(() => {
      setModalToggle(true);
    });
  };

  const closeModal = () => {
    requestAnimationFrame(() => {
      setModalToggle(false);
    });
  };
  const deleteMessage = async messsageId => {
    try {
      const result = await firestore()
        .collection('Messages')
        .doc(messageId)
        .delete();
      console.log('update state');

      setMessages(messages =>
        messages.filter(message => {
          if (message.messageId !== messageId) {
            return message;
          }
        }),
      );

      setModalToggle(false);
    } catch (err) {
      console.log(err);
    }
  };

  const forwardMessage = async messageId => {
    console.log('forward message ' + messageId);
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
              {/* {1===1?<Text>hello</Text>} */}
              {senderUid === auth().currentUser.uid && (
                <TouchableOpacity
                  onPress={() => deleteMessage(messageId)}
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
                onPress={() => likeMessage(messageId)}
                style={{marginBottom: 5}}>
                <Text>like messsage</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
      <TouchableOpacity
        onLongPress={openModal}
        style={[
          styles.box,
          auth().currentUser.uid === senderUid ? styles.sent : styles.received,
        ]}>
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
