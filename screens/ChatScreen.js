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
import {useIsFocused} from '@react-navigation/native';

import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import moment from 'moment';
import ChatMessage from '../components/ChatMessage';
import Animated from 'react-native-reanimated';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import Entypo from 'react-native-vector-icons/Entypo';
import FeatherIcon from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
// import SimpleLineIcon from 'react-native-vector-icons/SimpleLineIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-crop-picker';
import CameraRollModal from '../components/CameraRollModal';
import PushNotification from 'react-native-push-notification';
import FastImage from 'react-native-fast-image';
// import { SafeAreaView } from 'react-native-safe-area-context';

const ChatScreen = props => {
  console.log('chat screen rendering');
  const navigation = useNavigation();
  const route = useRoute();
  const {conversationId, conversation} = route.params;
  // const conversationId = conversation.conversationId;
  // console.log(conversation);
  var receiver;
  if (auth().currentUser.uid === conversation.participants[0].uid) {
    receiver = conversation.participants[1];
  } else {
    receiver = conversation.participants[0];
  }

  // console.log(receiver);
  const sender = auth().currentUser;

  // console.log(sender);
  // console.log('conversation Id of room is ' + conversationId);

  //  {
  //     messageId: '',
  //     createdAt: '',
  //     image: '',
  //     text: '',
  //     senderUid: '',
  //     reply: '',
  //     isLiked: false,

  //     conversationId: '',
  //   },

  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const inputRef = useRef();
  const scrollViewRef = useRef();
  const [replyMessageBar, setReplyMessageBar] = useState(false);
  const [reply, setReply] = useState('');
  const [clickedImage, setClickedImage] = useState(null);
  const [cameraRollVisibility, setCameraRollVisibility] = useState(false);
  const [visible, setVisible] = useState(false);
  const isFocused = useIsFocused();
  useEffect(() => {
    setMessages(prevMessages => conversation.messages);
  }, []);

  // useEffect(() => {
  //   // console.log('get the receiver info in chat screen');
  //   let isMounted = true;

  //   const getReceiver = async () => {
  //     try {
  //       if (isMounted) {
  //         const response = await firestore()
  //           .collection('Users')
  //           .where('uid', '==', receiverUid)
  //           .get();
  //         const userDoc = response._docs[0]._data;
  //         setReceiver(prevReceiver => userDoc);
  //       }
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };

  //   getReceiver();
  //   return () => {
  //     isMounted = false;
  //   };
  // }, []);

  useLayoutEffect(() => {
    // console.log('setting the top layout  in chat screen');
    navigation.setOptions({
      title: 'yo',
      headerTitleAlign: 'left',
      headerBackVisible: false,
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FeatherIcon name="arrow-left" size={30} color="white" />
        </TouchableOpacity>
      ),

      headerTitle: () => (
        <View style={styles.profileContainer}>
          <Image
            resizeMode="contain"
            style={styles.profileImage}
            source={
              receiver.photoURL
                ? {
                    uri: receiver.photoURL,
                    // cache: FastImage.cacheControl.immutable,
                  }
                : require('../assets/images/uploadPhoto.png')
            }
          />
          <View>
            <Text style={styles.displayName}>{receiver?.displayName}</Text>
            <Text style={styles.onlineStatus}>active</Text>
          </View>
        </View>
      ),

      headerRight: () => (
        <TouchableOpacity>
          <Entypo name="dots-three-vertical" size={22} color="white" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, receiver]);

  useEffect(() => {
    const updateUnReadMessages = async () => {
      try {
        const lastMessage =
          conversation.messages[conversation.messages.length - 1];
        // console.log(lastMessage);

        if (auth().currentUser.uid !== lastMessage?.senderUid) {
          console.log('you are not the sender of msg');
          const conversationRef = await firestore()
            .collection('Conversations')
            .doc(conversationId);
          const messages = conversation.messages;
          // console.log(messages);
          const readMessages = messages.filter(message => {
            if (!message.isRead) {
              message.isRead = true;
            }

            return message;
          });
          // console.log(readMessages);

          const result = await conversationRef.update({messages: readMessages});

          //if the sender of the message
        }
      } catch (err) {
        console.log(err);
      }
    };
    updateUnReadMessages();
  }, []);

  useEffect(() => {
    scrollViewRef.current.scrollToEnd({
      animated: true,

      behavior: 'smooth',
    });
  }, []);

  // useEffect(() => {
  //   let isMounted = true;
  //   // console.log('get messsages in chat screen ');
  //   const getMessages = async () => {
  //     try {
  //       if (isMounted) {
  //         // console.log(`conversation id: ${conversationId}`);
  //         firestore()
  //           .collection('Messages')
  //           .where('conversationId', '==', conversationId)
  //           .orderBy('createdAt', 'asc')
  //           .onSnapshot(snapshot => {
  //             if (snapshot && snapshot._docs) {
  //               // snapshot._docs.map(doc => console.log(doc._data));

  //               setMessages(snapshot._docs.map(doc => doc._data));
  //             }
  //           });
  //       }
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };

  //   getMessages();

  //   return () => {
  //     isMounted = false;
  //   };
  // }, []);

  const handleNotification = message => {
    PushNotification.localNotification({
      channelId: 'test-channel',
      title: `${receiver.displayName} has sent a msg`,
      message: message.text,
    });
  };

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
        // console.log('send msg' + text);
        if (text !== '') {
          var message;
          if (reply === '') {
            message = {
              text: text,
              image: '',
              senderUid: sender.uid,

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
              senderUid: sender.uid,
              createdAt: firebase.firestore.FieldValue.serverTimestamp(),
              conversationId: conversationId,
              isLiked: false,
              isRead: false,
              reply: reply,
            };
          }
          // console.log(message);

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

          // const lastMessage = me;

          const result2 = await conversationRef.update({
            messages: [...messages, me],
            // lastMessage: me,
          });
          if (auth().currentUser.uid === receiver.uid) {
            //receiver
            handleNotification(message);
          }
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
        const conversationRef = await firestore()
          .collection('Conversations')
          .doc(conversationId);

        // const lastMessage = me;
        const filteredMessages = messages.filter(message => {
          if (message.messageId !== messageId) {
            return message;
          }
        });

        const result2 = await conversationRef.update({
          messages: filteredMessages,
          // lastMessage: messages[messages.length -1 ],
        });

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

      const conversationRef = await firestore()
        .collection('Conversations')
        .doc(conversationId);

      // const lastMessage = me;
      const filteredMessages = messages.filter(message => {
        if (message.messageId == messageId) {
          message.isLiked = true;
        }
        return message;
      });

      const result2 = await conversationRef.update({
        messages: filteredMessages,
        // lastMessage: messages[messages.length -1 ],
      });

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
        const conversationRef = await firestore()
          .collection('Conversations')
          .doc(conversationId);

        // const lastMessage = me;
        const filteredMessages = messages.filter(message => {
          if (message.messageId == messageId) {
            message.reply = 'nope';
          }
          return message;
        });

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

      const conversationRef = await firestore()
        .collection('Conversations')
        .doc(conversationId);

      // const lastMessage = me;
      const filteredMessages = messages.filter(message => {
        if (message.messageId == messageId) {
          message.isLiked = false;
        }
        return message;
      });

      const result2 = await conversationRef.update({
        messages: filteredMessages,
        // lastMessage: messages[messages.length -1 ],
      });
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
              contentContainerStyle={{paddingTop: 15, paddingHorizontal: 10}}
              ref={scrollViewRef}>
              {messages?.length === 0 && (
                <Text style={{color: 'black'}}>no messsages</Text>
              )}
              {messages?.map((message, id) => {
                return (
                  <ChatMessage
                    key={id}
                    receiverUid={receiver.uid}
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
                <FeatherIcon
                  style={styles.cameraIcon}
                  name="camera"
                  color="black"
                  size={28}
                />
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
                // selectionColor={'lightblue'}
              />
              {text ? (
                <TouchableOpacity
                  style={styles.sendBtn}
                  onPress={() => {
                    sendMsg(text);
                  }}>
                  <FeatherIcon
                    style={styles.sendBtn__icon}
                    name="send"
                    color="black"
                    size={20}
                  />
                </TouchableOpacity>
              ) : (
                // <Button
                //   style={styles.sendMsgBtn}

                //   title="send msg"
                // />
                <>
                  <TouchableOpacity onPress={() => openCameraRoll()}>
                    <AntDesign name="picture" color="black" size={30} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => openCameraRoll()}>
                    {/* <SimpleLineIcon name="microphone" /> */}
                    {/* <SimpleLineIcon name="phone" /> */}
                  </TouchableOpacity>
                </>
              )}
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
    backgroundColor: '#F1F1F1',
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    alignSelf: 'center',
    width: '90%',
    // padding: 12,
    paddingHorizontal: 20,
    backgroundColor: 'white',

    elevation: 5,
    borderRadius: 100,
    marginBottom: 20,
    height: 60,
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

    flex: 1,
    marginRight: 15,
    marginLeft: 15,
    fontFamily: 'Inter-Semibold',
    // backgroundColor: '#ECECEC',
    // padding: 8,
    color: 'grey',

    fontSize: 18,

    // borderColor: 'red',
    // borderWidth: 2,
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
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // borderWidth: 1,
    // borderColor: 'red',
    // padding: 10,
    alignItems: 'center',
    marginLeft: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 50,
    resizeMode: 'contain',
    marginRight: 5,
  },
  displayName: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  onlineStatus: {
    fontSize: 12,
    fontFamily: 'Inter-Light',
  },
  sendBtn: {
    borderRadius: 100,
    backgroundColor: '#3E45DF',

    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  sendBtn__icon: {
    transform: [{rotate: '45deg'}],
    color: 'white',
  },
});
