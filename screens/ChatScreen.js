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
// import {TouchableOpacity} from 'react-native-gesture-handler';

const ChatScreen = props => {
  const navigation = useNavigation();
  const route = useRoute();
  const {senderUid, receiverUid, conversationId} = route.params;
  const [sender, setSender] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);

  //make a request to db to fetch user data with a uid

  // useEffect(() => {
  //   firestore()
  //     .collection('Users')
  //     .where('uid', '==', senderUid)
  //     .get()
  //     .then(response => {
  //       // if (!isCancelled) {
  //       const userDoc = response._docs[0]._data;
  //       setSender(userDoc);
  //       // }
  //     })
  //     .catch(err => {
  //       console.log(err);
  //     });
  // }, [sender]);

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
    let isMounted = true;
    const getMessages = async () => {
      try {
        if (isMounted) {
          let temp = [];

          const response = await firestore()
            .collection('Messages')
            .orderBy('createdAt', 'asc')
            .get();

          response._docs.forEach(doc => {
            if (doc._data.conversationId == conversationId) {
              temp.push(doc._data);
            }
          });
          setMessages(prevMessages => temp);
          setMessages(prevMessages => console.log(prevMessages));
        }
      } catch (err) {
        console.log(err);
      }
    };

    getMessages();
    return () => {
      isMounted = false;
    };
  }, [route]);

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
      };

      const response = await firestore().collection('Messages').add(message);
      let messageId = response.id;
      const docRef = await firestore().collection('Messages').doc(messageId);
      // console.log(docRef);
      const result = await docRef.update({messageId: messageId});
      const res = await firestore().collection('Messages').doc(messageId).get();
      const updatedMessage = res._data;
     
      setMessages(prevMessages => console.log(prevMessages));

      setText('');
    }
    Keyboard.dismiss();
  };

  // const forwardMessage = () => {
  //   console.log('forward message');
  // };

  return (
    <View style={styles.container}>
      {messages &&
        (messages.length > 0 ? (
          <ScrollView style={{backgroundColor: 'grey', flex: 1, height: 100}}>
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
