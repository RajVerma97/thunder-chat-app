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
  ActivityIndicator,
  Modal,
  useWindowDimensions,
  ImageBackground,
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
// import Animated from 'react-native-reanimated';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import Entypo from 'react-native-vector-icons/Entypo';
import FeatherIcon from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
// import SimpleLineIcon from 'react-native-vector-icons/SimpleLineIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-crop-picker';
import PushNotification from 'react-native-push-notification';
import FastImage from 'react-native-fast-image';
import MediaBottomSheet from '../components/MediaBottomSheet';
import TopMenuModal from '../components/TopMenuModal';
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  FlatList,
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';
import WallpaperBottomSheet from '../components/WallpaperBottomSheet';


const ChatScreen = props => {
  console.log('chat screen rendering');
  const navigation = useNavigation();
  const route = useRoute();
  const {conversationId, conversation} = route.params;
  const conversationWallpaper = conversation.wallpaper;
  const wallpaperBottomSheetRef = useRef();
  const mediaBottomSheetRef = useRef();

  // const conversationId = conversation.conversationId;
 
  var receiver;
  if (auth().currentUser.uid === conversation.participants[0].uid) {
    receiver = conversation.participants[1];
  } else {
    receiver = conversation.participants[0];
  }
 

  const sender = auth().currentUser;

  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const inputRef = useRef();
  const scrollViewRef = useRef();
  const [replyMessageBar, setReplyMessageBar] = useState(false);
  const [reply, setReply] = useState('');
  const [clickedImage, setClickedImage] = useState(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backgroundWallpaper, setBackgroundWallpaper] = useState(null);
  const [topMenuToggle, setTopMenuToggle] = useState(false);
  const isFocused = useIsFocused();
  const dimensions = useWindowDimensions();
  const top = useSharedValue(dimensions.height);
  const closeTopMenu = () => {
    setTopMenuToggle(false);
  };
  const openTopMenu = () => {
   
    setTopMenuToggle(true);
  };
  const changeBackgroundWallpaper = async item => {
  
    await firestore()
      .collection('Conversations')
      .doc(conversationId)
      .update({wallpaper: item});
    setBackgroundWallpaper(item);
  };

  const showMediaBottomSheet = () => {
    
    Keyboard.dismiss();
    const isActive = mediaBottomSheetRef?.current?.isActive();
    if (isActive) {
      mediaBottomSheetRef?.current?.scrollTo(0);
    } else {
      mediaBottomSheetRef?.current?.scrollTo(-300);
    }
  };
  const changeTheme = useCallback(() => {
    Keyboard.dismiss();
  
    const isActive = wallpaperBottomSheetRef?.current?.isActive();
   
    
    wallpaperBottomSheetRef?.current?.scrollTo(0);
    if (isActive) {
      wallpaperBottomSheetRef?.current?.scrollTo(0);
    } else {
      wallpaperBottomSheetRef?.current?.scrollTo(-650);
    }

    // top.value = withSpring(dimensions.height / 2, {
    //   damping: 80,
    //   overshootClamping: true,
    //   restDisplacementThreshold: 0.1,
    //   restSpeedThreshold: 0.1,
    //   stiffness: 500,
    // });
  }, [wallpaperBottomSheetRef]);

    const handleNotification = (message) => {
    let myMsg = '';
    if (message.text !== '') {
      myMsg = message.text;
    } else if (message.image !== '') {
      myMsg = 'sent an image';
    } else if (message.video !== '') {
      myMsg = 'sent a video';
    }
    PushNotification.localNotification({
      channelId: 'test-channel',
      title: `${receiver.displayName} has sent a msg`,
      message: myMsg,
    });
  };

  const deleteAllMessages = async () => {
    // const result = await firestore().collection('Messsages').where('conversation');
    // setMessages(prevMessages=>prevMessages.forEach())
  

    firestore()
      .collection('Messages')
      .where('conversationId', '==', conversationId)
      .orderBy('createdAt', 'asc')
      .onSnapshot(async snapshot => {
        if (snapshot && snapshot._docs) {
          var msgs = [];

         
          snapshot._docs.map(doc => msgs.push(doc._data));
         
          for (msg of msgs) {
           

            let messageId = msg.messageId;
          
            await firestore().collection('Messages').doc(messageId).delete();
           
          }
          setMessages(prevMessages => []);

          //  setLoading(prevLoading => false);
        }
      });
  };
  useEffect(() => {
    if (conversationWallpaper) {
      setBackgroundWallpaper(conversationWallpaper);
    } else {
      setBackgroundWallpaper(null);
    }
  }, []);

  useLayoutEffect(() => {

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
            {receiver?.status === 'online' ? (
              <Text style={styles.onlineStatus}>online</Text>
            ) : (
              <Text style={styles.onlineStatus}>
                last seen {moment(receiver.status).fromNow()}
              </Text>
            )}
          </View>
        </View>
      ),

      headerRight: () => (
        <>
          <TouchableOpacity onPress={() => openTopMenu()}>
            <Entypo name="dots-three-vertical" size={22} color="white" />
          </TouchableOpacity>
        </>
      ),
    });
  }, [navigation, receiver]);

  useEffect(() => {
    const updateUnReadMessages = async () => {
      try {
        const lastMessage = messages[messages?.length - 1];
      

        if (auth().currentUser.uid !== lastMessage?.senderUid) {
        
          const messages = conversation.messages;
         
          messages?.map(async message => {
            if (!message.isRead) {
              // message.isRead = true;
              await firestore()
                .collection('Messages')
                .doc(message.messageId)
                .update({
                  isRead: true,
                });
            }
          });
        }
      } catch (err) {
        console.log(err);
      }
    };
    updateUnReadMessages();
  }, []);

 

  useEffect(() => {
    let isMounted = true;

  
    const getMessages = async () => {
      try {
        if (isMounted) {
          setLoading(prevLoading => true);

         
          firestore()
            .collection('Messages')
            .where('conversationId', '==', conversationId)
            .orderBy('createdAt', 'asc')
            .onSnapshot(snapshot => {
              if (snapshot && snapshot._docs) {
                if (snapshot._docs.length === 0) {
                  setLoading(prevLoading => false);
                }
                setMessages(snapshot._docs.map(doc => doc._data));

                setLoading(prevLoading => false);
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

  const openCamera = useCallback(async () => {
    Keyboard.dismiss();
    ImagePicker.openCamera({
      width: 300,
      height: 400,
      cropping: true,
    })
      .then(response => {
        const clickedImagePath = response.path;

        setClickedImage(prevClickedImage => clickedImagePath);
        // uploadImage(clickedImagePath);

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
          senderUid: sender.uid,
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
        const myDoc = await docRef.get();
        const updatedMsg = myDoc._data;

         if (auth().currentUser.uid !== sender.uid) {
            handleNotification(updatedMsg);
          }

        setMessages(prevMessages => [...prevMessages, updatedMsg]);

        // setClickedImage(prevClickedImage => null);
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  const sendMsg = useCallback(
    async text => {
     
      try {
     
        if (text !== '') {
          var message;
          if (reply === '') {
            message = {
              text: text,

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

              senderUid: sender.uid,
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
          const myDoc = await docRef.get();
          const updatedMsg = myDoc._data;

          if (auth().currentUser.uid !== sender.uid) {
            handleNotification(updatedMsg);
          }


          setMessages(prevMessages => [...prevMessages, updatedMsg]);


          setReply('');
          setText('');

         
          setReplyMessageBar(false);
        }
      } catch (err) {
        console.log(err);
      }
    

      Keyboard.dismiss();

      
    },
    [text],
  );
  

  const deleteMessage = useCallback(
    async messageId => {
      try {
        console.log('delete' + messageId);

        const result = await firestore()
          .collection('Messages')
          .doc(messageId)
          .delete();

        setMessages(messages =>
          messages?.filter(message => {
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
        messages?.filter(message => {
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
    async (messageId, repliedContent) => {
      try {
        await firestore()
          .collection('Messages')
          .doc(messageId)
          .update({reply: reply});
       

        setReply(repliedContent);

      
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
        messages?.filter(message => {
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
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaView style={{flex: 1}}>
        <WallpaperBottomSheet
          ref={wallpaperBottomSheetRef}
          backgroundWallpaper={backgroundWallpaper}
          setBackgroundWallpaper={setBackgroundWallpaper}
          changeBackgroundWallpaper={changeBackgroundWallpaper}
        />
        <MediaBottomSheet
          ref={mediaBottomSheetRef}
          sender={sender}
          conversationId={conversationId}
          messages={messages}
          setMessages={setMessages}
        />

        <View style={styles.container}>
          <TopMenuModal
            topMenuToggle={topMenuToggle}
            closeTopMenu={closeTopMenu}
            deleteAllMessages={deleteAllMessages}
            changeTheme={changeTheme}
          />

          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <>
              <ImageBackground style={{flex: 1}} source={backgroundWallpaper}>
                <ScrollView
                  contentContainerStyle={{
                    paddingTop: 15,
                    paddingHorizontal: 10,
                  }}
                  ref={scrollViewRef}
                  onContentSizeChange={() =>
                    scrollViewRef.current.scrollToEnd({
                      animated: false,
                    })
                  }>
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
                        receiver={receiver}
                      />
                    );
                  })}
                </ScrollView>
                {replyMessageBar && (
                  <View style={styles.replyMessageBar}>
                    <View style={styles.replyMessageBar__left}>
                      <TouchableOpacity style={styles.replyBtn}>
                        <Entypo style={styles.replyBtn__icon} name="reply" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.replyMessageBar__right}>
                      <Text style={styles.senderOfMsgText}>Rajneesh Verma</Text>
                      <Text
                        style={styles.originalMessageText}
                        numberOfLines={1}>
                        {reply}
                      </Text>
                      {/* {reply.text !== '' ? (
                        <Text style={styles.repliedText}>this is me</Text>
                      ) : null}

                      {reply.image !== '' ? (
                        <Image
                          style={styles.repliedImage}
                          source={{uri: reply.image}}
                        />
                      ) : null} */}
                    </View>
                    <TouchableOpacity
                      onPress={() => setReplyMessageBar(false)}
                      style={styles.closeReplyBarBtn}>
                      <AntDesign
                        style={styles.closeReplyBarBtn__icon}
                        name="closecircleo"
                      />
                    </TouchableOpacity>
                    {/* <Text style={{color: 'blue'}}>reply to {reply}</Text> */}
                  </View>
                )}

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
                      <TouchableOpacity onPress={() => showMediaBottomSheet()}>
                        <AntDesign name="picture" color="black" size={30} />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </ImageBackground>
            </>
          </TouchableWithoutFeedback>
        </View>

        {/* {visible ? <Text>i am visible</Text> : <Text>i am not visible</Text>} */}
      </SafeAreaView>
    </GestureHandlerRootView>
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
    // position: 'absolute',
    // top: 350,
    // left: 17,
    width: '90%',

    backgroundColor: 'black',
    // borderRadius: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,

    alignSelf: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    padding: 15,
    marginBottom: 10,
    // elevation: 5,
  },
  replyMessageBar__left: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  replyBtn__icon: {
    fontSize: 24,
    color: 'lightblue',
  },
  replyMessageBar__right: {
    flex: 1,
  },
  senderOfMsgText: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: 'white',
    marginBottom: 4,
  },
  originalMessageText: {
    fontSize: 14,
    fontFamily: 'Inter-Light',
    color: 'lightgrey',
  },
  closeReplyBarBtn__icon: {
    fontSize: 20,
    color: 'white',
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
