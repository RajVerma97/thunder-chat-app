import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Button,
  Keyboard,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import {useState, useEffect, useLayoutEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import moment from 'moment';
import ChatMessage from '../components/ChatMessage';
import Animated from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/AntDesign';

const ChatScreen = props => {
  const navigation = useNavigation();
  const route = useRoute();
  const {senderUid, receiverUid, conversationId} = route.params;
  const [sender, setSender] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const getReceiver = async () => {
      try {
        if (isMounted) {
          const response = await firestore()
            .collection('Users')
            .where('uid', '==', receiverUid)
            .get();
          const userDoc = response._docs[0]._data;
          setReceiver(prevReceiver => userDoc);

          // console.log(receiver);
        }
      } catch (err) {
        console.log(err);
      }
    };

    getReceiver();
    return () => {
      isMounted = false;
    };
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '',

      headerTitleAlign: 'left',
      headerBackTitleVisible: false,
      headerTitle: () => (
        <View
          styles={{
            flexDirection: 'row',
          }}>
          <Image
            resizeMode="contain"
            style={{width: 40, height: 40, borderRadius: 50}}
            source={
              receiver?.photoURL
                ? {uri: receiver?.photoURL}
                : {
                    uri: 'https://cdn-icons.flaticon.com/png/128/3177/premium/3177440.png?token=exp=1658665759~hmac=4e34310b6a73c6ead296625199738d20',
                  }
            }
          />
          <Text style={{color: 'black', fontSize: 10, fontWeight: 'bold'}}>
            {receiver?.displayName}
          </Text>
        </View>
      ),

      headerRight: () => (
        <View style={{flexDirection: 'row'}}>
          <Text>+</Text>
          <Text>-</Text>
        </View>
      ),
    });
  }, [navigation, receiver]);

  useLayoutEffect(() => {
    console.log('get initial messages');
    let isMounted = true;
    const getMessages = async () => {
      try {
        if (isMounted) {
          // console.log(`conversation id: ${conversationId}`);
          firestore()
            .collection('Messages')
            .where('conversationId', '==', conversationId)
            .orderBy('createdAt', 'asc')
            .onSnapshot(snapshot => {
              if (snapshot && snapshot._docs) {
                setMessages(snapshot._docs.map(doc => doc._data));
              }
            });
        }
      } catch (err) {
        console.log(err);
      }
    };

    getMessages();
    return () => {
      isMounted = false;
    };
  }, []);

  //fetch all messages
  // alert(senderUid);

  const sendMsg = async text => {
    //create a msg collection
    if (text !== '') {
      const message = {
        text: text,
        senderUid: senderUid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        conversationId: conversationId,
        isLiked:false
      };

      const response = await firestore().collection('Messages').add(message);
      let messageId = response.id;
      const docRef = await firestore().collection('Messages').doc(messageId);
      // console.log(docRef);
      const result = await docRef.update({messageId: messageId});
      const updatedMessage = await firestore()
        .collection('Messages')
        .doc(messageId)
        .get();
      // setMessages([ {message: message},...messages,]);
      const me = updatedMessage._data;
      // console.log(me);

      setMessages([...messages, me]);

      setText('');
    }
    Keyboard.dismiss();
  };

  // const forwardMessage = () => {
  //   console.log('forward message');
  // };

  const likeMessage = async(messageId) => {
    console.log('like message ' + messageId);
    const messageRef = await firestore().collection('Messages').doc(messageId);
    const updatedMessage = messageRef.update({ isLiked: true });
  };

  return (
    <View style={styles.container}>
      {messages &&
        (messages.length > 0 ? (
          <ScrollView style={{backgroundColor: 'grey', flex: 1, height: 100}}>
            {messages.map((message, id) => {
              return (
                <ChatMessage
                  setMessages={setMessages}
                  messages={messages}
                  key={id}
                  message={message}
                  likeMessage={likeMessage}
                />
              );
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
        {text ? (
          <Button
            style={styles.sendMsgBtn}
            onPress={() => {
              sendMsg(text);
            }}
            title="send msg"
          />
        ) : (
          <></>
        )}

        <TouchableOpacity onPress={() => console.log('show bottom sheet')}>
          <Icon name="picture" color="black" size={30} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => console.log('show bottom sheet')}>
          <Icon name="gift" color="black" size={40} />
        </TouchableOpacity>
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
    width: '50%',
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
