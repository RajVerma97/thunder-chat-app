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
import {ConversationsContext} from '../Context/ConversationsContext';

const WelcomeScreen = props => {
  // console.log('welcome screen rendering');
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const route = useRoute();
  // const {conversations, setConversations} = useContext(ConversationsContext);
  const [conversations, setConversations] = useState([]);

  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  //  {
  //     conversationId: '',
  //     participants: [],
  //     receiverDisplayName: '',
  //     receiverPhotoUrl: '',
  //     receiverUid: '',
  //     lastMessage: '',
  //     unseenNumbers: 0,
  //     wallpaper: '',
  //   },
  // const [conversations, setConversations] = useState([]);

  // const [lastMessage, setLastMessage] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

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
      title: 'Thunder',
      headerTitle: () => (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
            <FeatherIcon name="menu" color="white" size={26} />
          </TouchableOpacity>
          <Text>Thunder</Text>
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
            onPress={() =>
              // console.log(conversations)
              navigation.navigate('SearchScreen')
            }>
            <FeatherIcon name="search" color="white" size={26} />
          </TouchableOpacity>
          {/* <TouchableOpacity>
            <FeatherIcon name="moon" color="white" size={26} />
          </TouchableOpacity> */}
        </View>
      ),
    });
  }, [navigation]);

  useLayoutEffect(() => {
    console.log('get conversations inside useEffect');
    setIsLoading(prevIsLoading => true);
    let isCancelled = false;
    const getConversations = async () => {
      try {
        if (!isCancelled) {
          const conversations = await firestore()
            .collection('Conversations')
            .get();

          let temp = [];
          conversations._docs.filter(doc => {
            try {
              const conversation = doc._data;
              //  console.log(conversation);

              if (
                conversation.participants[0].uid === auth().currentUser.uid ||
                conversation.participants[1].uid === auth().currentUser.uid
              ) {
                temp.push(conversation);
                // console.log(conversation.participants);
              }
            } catch (err) {
              console.log(err);
            }
          });
          // console.log(temp);
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
    var myConversation = conversation;
    console.log('original conversation');
    console.log(myConversation);
    // console.log('enter room:' + conversationId);
    try {
      // const messages = await firestore().collection('Messages').doc(conversationId);

      // firestore()
      //   .collection('Messages')
      //   .where('conversationId', '==', conversationId)
      //   .orderBy('createdAt', 'asc')
      //   .onSnapshot(snapshot => {
      //     if (snapshot && snapshot._docs) {
      //       var messages = [];

      //       snapshot._docs.map(doc => {
      //         const message = doc._data;

      //         messages.push(message);
      //       });

      // myConversation.messages = messages;
      // const conversationRef = firestore()
      //   .collection('Conversations')
      //   .doc(conversationId);

      // // const lastMessage = me;

      // const result = conversationRef
      //   .update({
      //     messages: messages,
      //   })
      //   .then(res => console.log('updated conversation'));

      navigation.navigate('ChatScreen', {
        conversationId: conversationId,
        conversation: myConversation,
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        {isLoading && <ActivityIndicator size={30} />}

        <ScrollView style={styles.conversationContainer}>
          {conversations?.length === 0 && <Text>no conversation</Text>}
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
      <Button
        title="get contacts"
        onPress={() => navigation.navigate('ContactScreen')}
      />
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
    backgroundColor: '#F1F1F1',
    paddingTop: 30,
    paddingHorizontal: 25,
  },
  conversationContainer: {
    // backgroundColor: 'blue'
  },
});

export default WelcomeScreen;
