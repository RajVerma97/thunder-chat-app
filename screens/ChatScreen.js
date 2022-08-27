import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TextInput,
  Button,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import React from 'react';
import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import moment from 'moment';
import ChatMessage from '../components/ChatMessage';
import Animated from 'react-native-reanimated';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-crop-picker';
import CameraRollModal from '../components/CameraRollModal';
// import { SafeAreaView } from 'react-native-safe-area-context';

const ChatScreen = props => {
  console.log('chat screen rendering');
  const navigation = useNavigation();
  const route = useRoute();
  const {senderUid, receiverUid, conversationId} = route.params;
  const [sender, setSender] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([
    {
      messageId: '',
      createdAt: '',
      image: '',
      text: '',
      senderUid: '',
      reply: '',
      isLiked: false,

      conversationId: '',
    },
  ]);
  const inputRef = useRef();
  const scrollViewRef = useRef();
  const [replyMessageBar, setReplyMessageBar] = useState(false);
  const [reply, setReply] = useState('');
  const [clickedImage, setClickedImage] = useState(null);
  const [cameraRollVisibility, setCameraRollVisibility] = useState(false);
  const [visible, setVisible] = useState(false);


  

  useEffect(() => {
    // console.log('get the receiver info in chat screen');
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
    // console.log('setting the top layout  in chat screen');
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

      // headerLeft: () => (
      //   <TouchableOpacity onPress={navigation.goBack}>
      //     <AntDesign name="arrowleft" size={24} color="black" />
      //   </TouchableOpacity>
      // ),

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
    // console.log('get messsage in chat screen ');
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
                setMessages(prevMessages =>
                  snapshot._docs.map(doc => doc._data),
                );
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

  const uploadImage = useCallback(
    async clickedImagePath => {
      const uri = clickedImagePath;

      const filename = uri.substring(uri.lastIndexOf('/') + 1);
      const uploadUri =
        Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
      // console.log(uploadUri);

      const task = storage().ref(filename).putFile(uploadUri);

      // set progress state
      task.on('state_changed', snapshot => {
        // setTransferred(
        //     Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 10000
        // );
      });
      try {
        await task;
        // console.log('uploaded to storage with fileName' + filename);
      } catch (e) {
        console.error(e);
      }
      setClickedImage(null);
    },
    [clickedImage],
  );
  const openCameraRoll = () => {
    setVisible(true);
  };

  const openCamera = useCallback(async () => {
    ImagePicker.openCamera({
      width: 300,
      height: 400,
      cropping: true,
    })
      .then(response => {
        const clickedImagePath = response.path;

        setClickedImage(prevClickedImage => clickedImagePath);

        sendImage(clickedImagePath);
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  const sendImage = useCallback(async clickedImagePath => {
    try {
      if (clickedImagePath) {
        const message = {
          text: '',
          image: clickedImagePath,
          senderUid: senderUid,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          conversationId: conversationId,
          isLiked: false,
          isRead: false,
          reply: '',
        };

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

        setClickedImage(prevClickedImage => null);
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  const sendMsg = useCallback(
    async text => {
      // console.log('sending msg');
      try {
        console.log('send msg' + text);
        if (text !== '') {
          var message;
          if (reply === '') {
            message = {
              text: text,
              image: '',
              senderUid: senderUid,

              createdAt: firebase.firestore.FieldValue.serverTimestamp(),
              conversationId: conversationId,
              isLiked: false,
              isRead: false,
              reply: '',
            };
          } else {
            message = {
              text: text,
              image: '',
              senderUid: senderUid,
              createdAt: firebase.firestore.FieldValue.serverTimestamp(),
              conversationId: conversationId,
              isLiked: false,
              isRead: false,
              reply: reply,
            };
          }

          const response = await firestore()
            .collection('Messages')
            .add(message);
          let messageId = response.id;
          const docRef = await firestore()
            .collection('Messages')
            .doc(messageId);
          const result = await docRef.update({messageId: messageId});
          const res = await firestore()
            .collection('Messages')
            .doc(messageId)
            .get();
          const me = res._data;

          const conversationRef = await firestore()
            .collection('Conversations')
            .doc(me.conversationId);

          const lastMessage = me.text;

          const result2 = await conversationRef.update({
            lastMessage: lastMessage,
          });
          setReply('');
          setText('');

          setMessages([...messages, me]);
          setReplyMessageBar(false);
        }
      } catch (err) {
        console.log(err);
      }

      Keyboard.dismiss();

      //create a msg collection
    },
    [text],
  );
  // console.log(text);

  // const forwardMessage = () => {
  //   console.log('forward message');
  // };

  const deleteMessage = useCallback(
    async messageId => {
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
    },
    [messages],
  );
  const likeMessage = useCallback(
    async messageId => {
      const messageRef = await firestore()
        .collection('Messages')
        .doc(messageId);
      const updatedMessage = messageRef.update({isLiked: true});
      setMessages(messages =>
        messages.filter(message => {
          if (message.messageId == messageId) {
            message.isLiked = true;
          }
          return messages;
        }),
      );
    },
    [messages],
  );
  const replyMessage = useCallback(
    async (messageId, message) => {
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
    },
    [messages],
  );

  const unLikeMessage = useCallback(
    async messageId => {
      const messageRef = await firestore()
        .collection('Messages')
        .doc(messageId);
      const updatedMessage = messageRef.update({isLiked: false});
      setMessages(messages =>
        messages.filter(message => {
          if (message.messageId == messageId) {
            message.isLiked = false;
          }
          return messages;
        }),
      );
    },
    [messages],
  );

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <>
            <ScrollView
              contentContainerStyle={{paddingTop: 15}}
              ref={scrollViewRef}
              onContentSizeChange={() =>
                scrollViewRef.current.scrollToEnd({
                  animated: true,

                  behavior: 'smooth',
                })
              }>
              {messages.map((message, id) => {
                return (
                  <ChatMessage
                    key={id}
                    receiverUid={receiverUid}
                    message={message}
                    likeMessage={likeMessage}
                    unLikeMessage={unLikeMessage}
                    deleteMessage={deleteMessage}
                    replyMessage={replyMessage}
                  />
                );
              })}
              {replyMessageBar && (
                <View style={styles.replyMessageBar}>
                  <Text>reply to {reply}</Text>
                </View>
              )}
              <CameraRollModal visible={visible} setVisible={setVisible} />
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity onPress={() => openCamera()}>
                <FontAwesome name="camera" color="black" size={30} />
              </TouchableOpacity>

              <TextInput
                autoFocus={true}
                ref={inputRef}
                value={text}
                onChangeText={t => setText(t)}
                onSubmitEditing={() => sendMsg(text)}
                style={styles.textInput}
                placeholder="message..."
                placeholderTextColor="grey"
              />
              {text ? (
                <TouchableOpacity
                  onPress={() => {
                    sendMsg(text);
                  }}>
                  <Ionicons name="send" color="purple" size={26} />
                </TouchableOpacity>
              ) : (
                // <Button
                //   style={styles.sendMsgBtn}

                //   title="send msg"
                // />
                <></>
              )}
              <TouchableOpacity onPress={() => openCameraRoll()}>
                <AntDesign name="picture" color="black" size={30} />
              </TouchableOpacity>
            </View>
          </>
        </TouchableWithoutFeedback>
      </View>

      {/* {visible ? <Text>i am visible</Text> : <Text>i am not visible</Text>} */}
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 15,
  },
  // wrapper: {
  //   position: 'absolute',
  //   bottom: 0,
  //   left: 0,
  //   width: '100%',
  //   flex: 1,
  //   flexDirection: 'row',
  //   justifyContent: 'space-around',
  // },

  textInput: {
    bottom: 0,
    height: 40,
    flex: 1,
    marginRight: 15,
    backgroundColor: '#ECECEC',
    padding: 10,
    color: 'grey',
    borderRadius: 30,
    fontSize: 16,
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
    backgroundColor: 'black',
  },
});
