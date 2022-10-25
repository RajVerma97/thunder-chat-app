import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Button,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useContext,
} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useIsFocused} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import {useRoute} from '@react-navigation/native';
import Video from 'react-native-video';
import {Dimensions} from 'react-native';
import FastImage from 'react-native-fast-image';
import firebase from '@react-native-firebase/app';
import storage from '@react-native-firebase/storage';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FeatherIcon from 'react-native-vector-icons/Feather';
import auth from '@react-native-firebase/auth';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
import Conversation from '../components/Conversation';
import PushNotification from 'react-native-push-notification';
import {DarkModeContext} from '../Context/DarkModeContext';
import LottieView from 'lottie-react-native';

const WelcomeScreen = props => {
  console.log('welcome screen rendering');
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const route = useRoute();
  const [conversations, setConversations] = useState([]);

  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const {darkMode, setDarkMode, toggleDarkMode} = useContext(DarkModeContext);

  const videoPlayer = useRef();

  // const goFullScreen = () => {
  //   console.log('go full screen');
  //   if (videoPlayer.current) {
  //     videoPlayer.current.presentFullScreenPlayer();
  //   }
  // };
  useEffect(() => {
    createChannels();
  }, []);

  const createChannels = () => {
    PushNotification.createChannel({
      channelId: 'test-channel',
      channelName: 'test channel',
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity
            onPress={() => navigation.toggleDrawer()}
            style={{marginRight: 10}}>
            <FeatherIcon name="menu" color="#EEEEEE" size={28} />
          </TouchableOpacity>
          <Text
            style={{
              fontFamily: 'Inter-Regular',
              fontSize: 20,
              color: '#EEEEEE',
            }}>
            Thunder
          </Text>
        </View>
      ),

      headerRight: () => (
        <View
          style={{
            // flex:1,
            // width: 100,
            // backgroundColor: 'pink',

            flexDirection: 'row',
            // justifyContent: '',
            alignItems: 'center',
            padding: 12,
          }}>
          <TouchableOpacity
            onPress={() => {
              toggleDarkMode();
            }}>
            <FeatherIcon
              name={darkMode ? 'moon' : 'sun'}
              color="#EEEEEE"
              size={24}
            />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, darkMode]);

  useLayoutEffect(() => {
    console.log('get conversations inside useEffect');

    let isCancelled = false;

    const getConversations = async () => {
      try {
        if (!isCancelled) {
          setIsLoading(prevIsLoading => true);
          const conversations = await firestore()
            .collection('Conversations')
            .get();

          let temp = [];
          var x;
          conversations._docs.forEach(doc => {
            try {
              const conversation = doc._data;

              if (
                conversation.participants[0].uid === auth().currentUser.uid ||
                conversation.participants[1].uid === auth().currentUser.uid
              ) {
                temp.push(conversation);
              }
            } catch (err) {
              console.log(err);
            }
          });

          setConversations(prevConversations => temp);

          setIsLoading(prevIsLoading => false);
        }
      } catch (err) {
        console.log(err);
      }
    };
    if (isFocused) {
      getConversations();
    }

    return () => {
      isCancelled = true;
    };
  }, [isFocused]);

  const enterChat = async (conversationId, conversation) => {
    try {
      navigation.navigate('ChatScreen', {
        conversationId: conversationId,
        conversation: conversation,
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <SafeAreaView
        style={[
          styles.container,
          darkMode ? styles.container__dark : styles.container__light,
        ]}>
        {!isLoading ? (
          conversations?.length === 0 && (
            <View style={styles.emptyWrapper}>
              <LottieView
                autoPlay
                loop
                source={require('../assets/lottie/emptyBox.json')}
                style={{width: 260, height: 260}}
              />
              <Text style={styles.emptyWrapper__text}>
                no chats, tap button below to chat
              </Text>
            </View>
          )
        ) : (
          <></>
        )}
        {isLoading ? <ActivityIndicator size={30} /> : null}

        <ScrollView style={styles.conversationContainer}>
          {conversations?.length > 0 &&
            conversations?.map((conversation, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() =>
                    enterChat(conversation.conversationId, conversation)
                  }>
                  <Conversation conversation={conversation} />
                </TouchableOpacity>
              );
              return;
            })}
        </ScrollView>
      </SafeAreaView>

      <TouchableOpacity
        style={styles.addContactsBtn}
        onPress={() => navigation.navigate('ContactScreen')}>
        <FeatherIcon style={styles.addContactsBtn__icon} name="plus" />
      </TouchableOpacity>
    </>

    //   {/* <Video
    //     ref={videoPlayer}
    //     source={{
    //       uri: 'https://statusguide.com/anykreeg/2021/06/yt1s.com-goku-ultra-instinct-form-WhatsApp-status-video-_1080pFHR.mp4',
    //     }}
    //     style={[
    //       {alignSelf: 'center', width: 300, height: 300},
    //       isFullScreen && {width: windowWidth, height: windowHeight},
    //     ]}
    //     controls={true}
    //     paused={!isPlaying}
    //     repeat={true}

    //     muted={isMuted}></Video> */}
    //   {/* <Button
    //     title={isPlaying ? 'stop' : 'play'}
    //     onPress={() => setIsPlaying(prevIsPlaying => !prevIsPlaying)}></Button>
    //   <Button
    //     title={isMuted ? 'unmute' : 'mute'}
    //     onPress={() => setIsMuted(prevIsMuted => !prevIsMuted)}></Button>
    //   <Button
    //     title="go full screen"
    //     onPress={() =>
    //       setIsFullScreen(prevIsFullScreen => !prevIsFullScreen)
    //     }></Button> */}
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 25,
  },
  container__light: {
    backgroundColor: '#f1f1f1',
  },
  container__dark: {
    backgroundColor: '#393E46',
  },
  addContactsBtn: {
    position: 'absolute',
    bottom: 50,

    backgroundColor: '#3282B8',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 50,
    alignSelf: 'center',
  },
  addContactsBtn__icon: {
    fontSize: 36,
    color: 'white',
  },
  addContactsBtn__text: {
    fontWeight: '700',
    fontFamily: 'Inter-bold',
    fontSize: 22,
    color: 'white',
  },
  emptyWrapper: {
    justifyContent: 'center',
    alignItems: 'center',

    padding: 10,

    height: 450,
  },
  emptyWrapper__text: {
    color: 'tomato',
    fontSize: 22,
    fontFamily: 'Inter-Medium',
    marginTop: 30,
    textTransform: 'capitalize',
  },
});

export default WelcomeScreen;
