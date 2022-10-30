import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TextInput,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  ImageBackground,
  FlatList,
} from 'react-native';

import React from 'react';
import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useMemo,
  useContext,
} from 'react';
import {useNavigation, useRoute, useIsFocused} from '@react-navigation/native';

import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import moment from 'moment';
import ChatMessage from '../components/ChatMessage';
import Entypo from 'react-native-vector-icons/Entypo';
import FeatherIcon from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
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
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';
import WallpaperBottomSheet from '../components/WallpaperBottomSheet';
import {DarkModeContext} from '../Context/DarkModeContext';
import EmojiData from '../emojiData.json';
import Emoji from '../components/Emoji';

var emojiArr = Object.keys(EmojiData);

const ChatScreen = props => {
  // console.log('chat screen rendering');
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
  const [emojiSelectorToggle, setEmojiSelectorToggle] = useState(false);

  const [reply, setReply] = useState('');
  const [clickedImage, setClickedImage] = useState(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backgroundWallpaper, setBackgroundWallpaper] = useState(null);
  const [topMenuToggle, setTopMenuToggle] = useState(false);
  const {darkMode, setDarkMode, toggleDarkMode} = useContext(DarkModeContext);
  const [receiverStatus, setReceiverStatus] = useState(null);

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

  const showMediaBottomSheet = useCallback(() => {
    Keyboard.dismiss();
    if (emojiSelectorToggle) {
      setEmojiSelectorToggle(false);
    }
    const isActive = mediaBottomSheetRef?.current?.isActive();
    if (isActive) {
      mediaBottomSheetRef?.current?.scrollTo(0);
    } else {
      mediaBottomSheetRef?.current?.scrollTo(-300);
    }
  }, [mediaBottomSheetRef]);

  const showEmojiBottomSheet = useCallback(() => {
    Keyboard.dismiss();

    setEmojiSelectorToggle(prevEmojiSelectorToggle => !prevEmojiSelectorToggle);
  }, [emojiSelectorToggle]);

  const changeTheme = useCallback(() => {
    Keyboard.dismiss();
    if (emojiSelectorToggle) {
      setEmojiSelectorToggle(false);
    }
    const isActive = wallpaperBottomSheetRef?.current?.isActive();

    wallpaperBottomSheetRef?.current?.scrollTo(0);
    if (isActive) {
      wallpaperBottomSheetRef?.current?.scrollTo(0);
    } else {
      wallpaperBottomSheetRef?.current?.scrollTo(-650);
    }
  }, [wallpaperBottomSheetRef]);

  const handleNotification = message => {
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

  const deleteAllMessages = useCallback(async () => {
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
  }, []);

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
                : require('../assets/images/user.png')
            }
          />
          <View>
            <Text style={styles.displayName}>{receiver?.displayName}</Text>
            {/* <Text style={{color: 'red'}}>{receiverStatus}</Text> */}
            {receiverStatus === 'online' ? (
              <Text style={styles.onlineStatus}>online</Text>
            ) : (
              <Text style={styles.onlineStatus}>
                last seen {receiverStatus}
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
    let isMounted = true;
    const getReceiverStatus = async () => {
      try {
        if (isMounted) {
          const response = await firestore()
            .collection('Users')
            .doc(receiver.uid)
            .get();
          let receiverStatus = response._data.status;
          console.log('receiver status is');
          console.log(moment(receiverStatus.toDate()).fromNow());
          setReceiverStatus(prevReceiverStatus =>
            moment(receiverStatus.toDate()).fromNow(),
          );
        }
      } catch (err) {
        console.log(err);
      }
    };
    getReceiverStatus();
    return () => {
      isMounted = false;
    };
  }, []);

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
                setMessages(
                  snapshot._docs.map(doc => {
                    // console.log(doc._data);
                    return doc._data;
                  }),
                );

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
      // showEmojiBottomSheet();
      setEmojiSelectorToggle(false);
    },
    [text],
  );

  const deleteMessage = useCallback(
    async messageId => {
      try {
        // console.log('delete' + messageId);

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

  const renderItem = useCallback(
    ({item, index}) => <Emoji item={item} index={index} setText={setText} />,
    [],
  );

  const keyExtractor = useCallback((item, index) => index.toString(), []);

  const ITEM_HEIGHT = 200;

  const getItemLayout = useCallback(
    (data, index) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
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

        <View
          style={[
            styles.container,
            darkMode ? {backgroundColor: '#393E46'} : null,
          ]}>
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
                  {emojiSelectorToggle ? (
                    <TouchableOpacity onPress={() => showEmojiBottomSheet()}>
                      <AntDesign name="closecircleo" color="black" size={30} />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => showEmojiBottomSheet()}>
                      <Entypo name="emoji-happy" color="black" size={30} />
                    </TouchableOpacity>
                  )}

                  <TextInput
                    autoFocus={true}
                    ref={inputRef}
                    value={text}
                    onChangeText={t => {
                      setText(t);

                      // else {
                      //   setEmoji(t);
                      // }
                    }}
                    onSubmitEditing={() => sendMsg(text)}
                    style={styles.textInput}
                    placeholder="message..."
                    placeholderTextColor="grey"
                    onTouchStart={() => {
                      if (emojiSelectorToggle) {
                        setEmojiSelectorToggle(false);
                      }
                    }}
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
                    <>
                      <TouchableOpacity onPress={() => openCamera()}>
                        <FeatherIcon
                          style={styles.cameraIcon}
                          name="camera"
                          color="black"
                          size={28}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{marginLeft: 8}}
                        onPress={() => showMediaBottomSheet()}>
                        <AntDesign name="picture" color="black" size={30} />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
                {emojiSelectorToggle ? (
                  <View style={styles.emojiSelectorWrapper}>
                    <FlatList
                      data={emojiArr}
                      renderItem={renderItem}
                      numColumns={6}
                      keyExtractor={keyExtractor}
                      initialNumToRender={10}
                      maxToRenderPerBatch={8}
                      windowSize={8}
                      // getItemLayout={getItemLayout}
                    />
                  </View>
                ) : null}
              </ImageBackground>
            </>
          </TouchableWithoutFeedback>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
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
    justifyContent: 'space-around',
    alignSelf: 'center',
    width: '92%',
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

  emojiSelectorWrapper: {
    width: '100%',
    height: 400,
    backgroundColor: '#E2E2E2',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
  },
});
