import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight,
} from 'react-native';
import React, {useEffect} from 'react';
import auth from '@react-native-firebase/auth';
import moment from 'moment';

const ChatMessage = props => {
  const {text, senderUid, createdAt} = props.message;

  useEffect(() => {}, []);

  return (
    <TouchableOpacity
      style={[
        styles.box,
        auth().currentUser.uid === senderUid ? styles.sent : styles.received,
      ]}>
      <Text style={styles.text}>{text}</Text>
      <Text style={styles.createdAt}>
        {moment(createdAt.seconds * 1000).format('HH:mm')}
      </Text>
    </TouchableOpacity>
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
