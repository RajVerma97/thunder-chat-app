import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Button,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
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

const WelcomeScreen = props => {
  // console.log('welcome screen rendering');
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const route = useRoute();

  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [user, setUser] = useState(null);
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
  const [conversations, setConversations] = useState([]);

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

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Thunder',
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
          <TouchableOpacity onPress={() => navigation.navigate('SearchScreen')}>
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
    let isCancelled = false;
    const getConversations = async () => {
      try {
        if (!isCancelled) {
          const conversations = await firestore()
            .collection('Conversations')
            .get();

          let temp = [];
          conversations._docs.filter(async doc => {
            try {
              const conversation = doc._data;
              if (
                conversation.participants.includes(
                  auth().currentUser.displayName,
                )
              ) {
                temp.push(conversation);
              }
            } catch (err) {
              console.log(err);
            }
          });
          console.log(temp);
          setConversations(prevConversations => temp);
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

  const enterChat = async (userBDisplayName, userBUid) => {
    try {
      let conversationId;
      const conversations = await firestore().collection('Conversations').get();
      let isUnique = true;

      var convId;

      conversations._docs.forEach(doc => {
        let conversation = doc._data;
        let isDuplicate = false;

        let temp = [user.displayName, userBDisplayName];
        let participants = conversation.participants;

        if (participants.includes(temp[0]) && participants.includes(temp[1])) {
          isDuplicate = true;
          convId = conversation.conversationId;
        }

        if (isDuplicate) {
          isUnique = false;
        }
      });

      if (isUnique) {
        const conversationsRef = firestore().collection('Conversations');

        const receiver = result2._docs[0]._data;
        const response = await firestore()
          .collection('Conversations')
          .add({
            participants: [user.displayName, userBDisplayName],
            lastMessage: '',
            unSeenNumbers: 0,
            wallpaper: '',
          });

        conversationId = response.id;

        const docRef = await firestore()
          .collection('Conversations')
          .doc(conversationId);
        const result = docRef.update({conversationId: conversationId});

        navigation.navigate('ChatScreen', {
          conversationId: conversationId,
          senderUid: user.uid,
          receiverUid: userBUid,
        });
      } else {
        navigation.navigate('ChatScreen', {
          conversationId: convId,
          senderUid: user.uid,
          receiverUid: userBUid,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.conversationContainer}>
        {conversations.length > 0 &&
          conversations.map((conversation, index) => {
            return (
              <TouchableOpacity
                key={index}
                onPress={() =>
                  enterChat(
                    conversation.receiverDisplayName,
                    conversation.receiverUid,
                  )
                }>
                <Conversation conversation={conversation} />
              </TouchableOpacity>
            );
            return;
          })}

        {/* {conversations.length > 0 &&
          conversations.map((conversation, index) => {
            //  return <Conversation conversation={conversation} key={index} />;
            <Text style={{color: 'black'}}>hey</Text>;
          })} */}
      </ScrollView>
    </SafeAreaView>
    // <View style={styles.container}>
    //   <Text>Logged in as {user?.displayName} </Text>
    //   <TouchableOpacity
    //     onPress={() =>
    //       navigation.navigate('SearchScreen', {
    //         conversations: conversations,
    //       })
    //     }>
    //     <AntDesign name="search1" color="white" size={30} />
    //   </TouchableOpacity>

    //   <FastImage
    //     style={{width: 200, height: 200}}
    //     source={{
    //       uri: profileImageUrl
    //         ? profileImageUrl
    //         : 'https://cdn-icons.flaticon.com/png/128/3177/premium/3177440.png?token=exp=1658665759~hmac=4e34310b6a73c6ead296625199738d20',
    //       cache: FastImage.cacheControl.immutable,
    //     }}
    //   />

    //   <Button title="sign out" onPress={() => auth().signOut()}></Button>
    //   <Button
    //     title="get contacts"
    //     onPress={() => navigation.navigate('ContactScreen')}
    //   />
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
    //   {conversations ? (
    //     <ScrollView>
    //       {conversations.length > 0 ? (
    //         <View>
    //           <Text>we have a conversations list</Text>
    //           {conversations.map((conversation, id) => {
    //             return (
    //               <ScrollView key={id}>
    //                 <Text>{conversation.receiverDisplayName}</Text>
    //                 <TouchableOpacity
    //                   onPress={() =>
    //                     enterChat(
    //                       conversation.receiverDisplayName,
    //                       conversation.receiverUid,
    //                     )
    //                   }>
    //                   <FastImage
    //                     style={{width: 50, height: 50}}
    //                     source={{
    //                       uri: conversation.receiverPhotoUrl
    //                         ? conversation.receiverPhotoUrl
    //                         : 'https://cdn-icons.flaticon.com/png/128/3177/premium/3177440.png?token=exp=1658665759~hmac=4e34310b6a73c6ead296625199738d20',
    //                       cache: FastImage.cacheControl.immutable,
    //                     }}
    //                   />
    //                   <Text>last msg--{conversation.lastMessage} </Text>
    //                   <Text>unseen Messages--{conversation.unSeenNumbers}</Text>
    //                 </TouchableOpacity>
    //               </ScrollView>
    //             );
    //           })}
    //         </View>
    //       ) : (
    //         <Text>conversation list is empty</Text>
    //       )}
    //     </ScrollView>
    //   ) : (
    //     <Text>loading conversation list</Text>
    //   )}
    // </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F1F1',
    padding: 10,
  },
});

export default WelcomeScreen;
