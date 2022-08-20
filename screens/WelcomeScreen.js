import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Button,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useLayoutEffect} from 'react';
import {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import {useRoute} from '@react-navigation/native';

import firebase from '@react-native-firebase/app';
import storage from '@react-native-firebase/storage';

import auth from '@react-native-firebase/auth';

const WelcomeScreen = props => {
  const navigation = useNavigation();
  const route = useRoute();
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    console.log('get user profile image url');
    let isCancelled = false;

    const getUserProfileImageUrl = async () => {
      try {
        if (!isCancelled) {
          const response = await firestore()
            .collection('Users')
            .where('uid', '==', auth().currentUser.uid.toString())
            .get();
          const userDoc = response.docs[0]._data;
          if (userDoc && userDoc.photoURL) {
            const photoURL = userDoc.photoURL;

            setUser(prevUser => userDoc);

            const filename = photoURL.split('Pictures/')[1];
            const url = await storage()
              .ref('/' + filename)
              .getDownloadURL();

            setProfileImageUrl(prevProfileImageUrl => url);
          }
        }
      } catch (err) {
        console.log(err);
      }
    };
    getUserProfileImageUrl();
    return () => {
      isCancelled = true;
    };
  }, []);

  useLayoutEffect(() => {
    let isCancelled = false;
    const getConversations = async () => {
      try {
        if (!isCancelled) {
          const conversations = await firestore()
            .collection('Conversations')
            .get();
          let temp = [];
          conversations._docs.forEach(doc => {
            const conversation = doc._data;
            if (
              conversation.participants.includes(auth().currentUser.displayName)
            ) {
              temp.push(conversation);
            }
          });

          for (let i = 0; i < temp.length; i++) {
            let elem;
            if (temp[i].participants[0] == auth().currentUser.displayName) {
              elem = temp[i].participants[1];
            } else if (
              temp[i].participants[1] == auth().currentUser.displayName
            ) {
              elem = temp[i].participants[0];
            }

            const response = await firestore()
              .collection('Users')
              .where('displayName', '==', elem)
              .get();
            const receiver = response._docs[0]._data;

            temp[i].receiver = receiver;
            let messages = [];

            const response2 = await firestore()
              .collection('Messages')
              .orderBy('createdAt', 'desc')
              .get();
            let convId = temp[i].conversationId;

            response2._docs.forEach(doc => {
              if (doc._data.conversationId == convId) {
                messages.push(doc._data);
              }
            });

            let lastMessage = messages[0]?.text;

            temp[i].lastMessage = lastMessage || 'empty';
          }

          setConversations(prevConversations => temp);
        }
      } catch (err) {
        console.log(err);
      }
    };
    getConversations();
    return () => {
      isCancelled = true;
    };
  }, [conversations]);

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
        const response = await firestore()
          .collection('Conversations')
          .add({
            participants: [user.displayName, userBDisplayName],
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
    <View style={styles.container}>
      <Text>Logged in as {user?.displayName} </Text>

      <Image
        style={{width: 200, height: 200}}
        source={{
          uri: profileImageUrl
            ? profileImageUrl
            : 'https://cdn-icons.flaticon.com/png/128/3177/premium/3177440.png?token=exp=1658665759~hmac=4e34310b6a73c6ead296625199738d20',
        }}
      />

      <Button title="sign out" onPress={() => auth().signOut()}></Button>
      <Button
        title="get contacts"
        onPress={() => navigation.navigate('ContactScreen')}
      />
      {conversations ? (
        <ScrollView>
          {conversations.length > 0 ? (
            <View>
              <Text>we have a conversations list</Text>
              {conversations.map((conversation, id) => {
                return (
                  <ScrollView key={id}>
                    <Text>{conversation.receiver.displayName}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        enterChat(
                          conversation.receiver.displayName,
                          conversation.receiver.uid,
                        )
                      }>
                      <Image
                        style={{width: 50, height: 50}}
                        source={
                          conversation.receiver.photoURL
                            ? {uri: conversation.receiver.photoURL}
                            : {
                                uri: 'https://cdn-icons.flaticon.com/png/128/3177/premium/3177440.png?token=exp=1658665759~hmac=4e34310b6a73c6ead296625199738d20',
                              }
                        }
                      />
                      <Text>{conversation.lastMessage}</Text>
                    </TouchableOpacity>
                  </ScrollView>
                );
              })}
            </View>
          ) : (
            <Text>conversation list is empty</Text>
          )}
        </ScrollView>
      ) : (
        <Text>loading conversation list</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WelcomeScreen;
