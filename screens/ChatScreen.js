import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Button,
  Keyboard,
  ScrollView,
} from 'react-native';
import React from 'react';
import {useState, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import ChatMessage from '../components/ChatMessage';
import moment from 'moment';

const ChatScreen = props => {
  const navigation = useNavigation();
  const route = useRoute();
  const {senderUid, receiverUid, conversationId} = route.params;
  const [sender, setSender] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState(null);
  //make a request to db to fetch user data with a uid

  useEffect(() => {
    firestore()
      .collection('Users')
      .where('uid', '==', senderUid)
      .get()
      .then(response => {
        const userDoc = response._docs[0]._data;
        setSender(userDoc);
      })
      .catch(err => {
        console.log(err);
      });

    firestore()
      .collection('Users')
      .where('uid', '==', receiverUid)
      .get()
      .then(response => {
        const userDoc = response._docs[0]._data;
        setReceiver(userDoc);
        console.log(receiver.lastSignInTime);
      })
      .catch(err => {
        console.log(err);
      });
    //fetch all messages
    // alert(senderUid);

    firestore()
      .collection('Messages')
      // .where('senderUid', '==', senderUid)
      .get()
      .then(response => {
        var messages = [];
        response._docs.map(doc => {
          const data = doc._data;

          // console.log(data.message.createdAt);

          if (
            data.message.senderUid === senderUid ||
            data.message.senderUid === receiverUid
          ) {
            messages.push(data.message);
          }
        });
        // console.log(messages);
        setMessages(messages);
      })
      .catch(err => {
        console.log(err);
      });
  }, [messages]);

  const sendMsg = text => {
    //create a msg collection
    if (text !== '') {
      const message = {
        text: text,
        senderUid: senderUid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      };
      console.log(message);
      firestore()
        .collection('Messages')
        .add({message})
        .then(response => {
          console.log('message saved to firestore');
        })
        .catch(err => {
          console.log(err);
        });
      setText('');
    }
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <Text>ChatScreen --{conversationId}</Text>

      {receiver && (
        <View>
          <Image
            style={{width: 50, height: 50}}
            source={{uri: receiver.photoURL}}
          />
          <Text>
            receiver is {receiver.displayName} ({receiver.phoneNumber})
          </Text>
          <Text>
            last seen at{' '} 5 pm
          </Text>
        </View>
      )}

      {messages &&
        (messages.length > 0 ? (
          <ScrollView style={{backgroundColor: 'grey', flex: 1}}>
            {messages.map((message, id) => {
              return <ChatMessage key={id} message={message} />;
            })}
          </ScrollView>
        ) : (
          <Text>No messages</Text>
        ))}

      <View style={styles.wrapper}>
        <TextInput
          value={text}
          onChangeText={t => setText(t)}
          style={styles.inputMsg}
          placeholder="type a msg..."
          placeholderTextColor="black"
        />
        <Button
          style={styles.sendMsgBtn}
          onPress={() => {
            sendMsg(text);
          }}
          title="send msg"
        />
      </View>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  inputMsg: {
    width: '70%',
    backgroundColor: 'lightgrey',
    color: 'black',
    fontSize: 18,
    padding: 12,
  },
  sendMsgBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
