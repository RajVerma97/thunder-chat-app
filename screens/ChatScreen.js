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
import {useState, useEffect, useLayoutEffect, useRef} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import moment from 'moment';
import ChatMessage from '../components/ChatMessage';
import Animated from 'react-native-reanimated';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import Entypo from 'react-native-vector-icons/Entypo';

const ChatScreen = props => {
  const navigation = useNavigation();
  const route = useRoute();
  const {senderUid, receiverUid, conversationId} = route.params;
  const [sender, setSender] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const inputRef = useRef();
  const [replyMessageBar, setReplyMessageBar] = useState(false);
  const [reply, setReply] = useState('');

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
        <View
          style={{
            width: 100,

            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <TouchableOpacity>
            <FontAwesome name="phone" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity>
            <FontAwesome name="video" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Entypo name="dots-three-vertical" size={24} color="black" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, receiver]);

  useLayoutEffect(() => {
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
    try {
      if (text !== '') {
        var message;
        if (reply === '') {
          message = {
            text: text,
            senderUid: senderUid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            conversationId: conversationId,
            isLiked: false,
            reply: '',
          };
        } else {
          message = {
            text: text,
            senderUid: senderUid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            conversationId: conversationId,
            isLiked: false,
            reply: reply,
          };
        }

        const response = await firestore().collection('Messages').add(message);
        let messageId = response.id;
        const docRef = await firestore().collection('Messages').doc(messageId);
        const result = await docRef.update({messageId: messageId});
        const updatedMessage = await firestore()
          .collection('Messages')
          .doc(messageId)
          .get();
        const me = updatedMessage._data;

        setMessages([...messages, me]);
        setReplyMessageBar(false);
        setReply('');
        setText('');
      }
    } catch (err) {
      console.log(err);
    }

    Keyboard.dismiss();

    //create a msg collection
  };

  // const forwardMessage = () => {
  //   console.log('forward message');
  // };

  const deleteMessage = async messageId => {
    try {
      const result = await firestore()
        .collection('Messages')
        .doc(messageId)
        .delete();

      setMessages(messages =>
        messages.filter(message => {
          if (message.messageId !== messageId) {
            return message;
          }
        }),
      );
    } catch (err) {
      console.log(err);
    }
  };

  const likeMessage = async messageId => {
    const messageRef = await firestore().collection('Messages').doc(messageId);
    const updatedMessage = messageRef.update({isLiked: true});
    setMessages(messages =>
      messages.filter(message => {
        if (message.messageId == messageId) {
          message.isLiked = true;
        }
        return messages;
      }),
    );
  };

  const replyMessage = async (messageId, message) => {
    try {
      const messageRef = await firestore()
        .collection('Messages')
        .doc(messageId);

      setReply(message);
      inputRef.current.focus();
      setReplyMessageBar(true);
    } catch (err) {
      console.log(err);
    }
  };

  const unLikeMessage = async messageId => {
    const messageRef = await firestore().collection('Messages').doc(messageId);
    const updatedMessage = messageRef.update({isLiked: false});
    setMessages(messages =>
      messages.filter(message => {
        if (message.messageId == messageId) {
          message.isLiked = false;
        }
        return messages;
      }),
    );
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
                  unLikeMessage={unLikeMessage}
                  deleteMessage={deleteMessage}
                  replyMessage={replyMessage}
                />
              );
            })}
          </ScrollView>
        ) : (
          <Text>No messages</Text>
        ))}

      {replyMessageBar && (
        <View style={styles.replyMessageBar}>
          <Text>reply to {reply}</Text>
        </View>
      )}
      <View style={styles.wrapper}>
        <TouchableOpacity onPress={() => console.log('show bottom sheet')}>
          <FontAwesome name="camera" color="black" size={30} />
        </TouchableOpacity>

        <TextInput
          autoFocus={true}
          ref={inputRef}
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
          <FontAwesome name="gift" color="black" size={30} />
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
  replyMessageBar: {
    position: 'absolute',
    top: 250,
    left: 17,
    width: 200,
    height: 50,
    backgroundColor: 'blue',
  },
});
