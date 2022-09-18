import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useEffect, memo, useContext} from 'react';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import {PermissionsAndroid} from 'react-native';
import Contacts from 'react-native-contacts';
import {useNavigation} from '@react-navigation/native';
import Contact from '../components/Contact';
import {ConversationsContext} from '../Context/ConversationsContext';

const ContactScreen = () => {
  const navigation = useNavigation();

  const [userList, setUserList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState('');
  // const {conversations, setConversations} = useContext(ConversationsContext);

  const user = auth().currentUser;

  useEffect(() => {
    //fetch all other users in the database
    let isCancelled = false;
    const getUserList = async () => {
      setLoading(true);
      try {
        if (!isCancelled) {
          // console.log('get user list from db');

          const response = await firestore()
            .collection('Users')
            .where('uid', '!=', auth().currentUser.uid.toString())
            .get();
          const myList = [];
          //   console.log(response);
          response._docs.forEach(doc => {
            myList.push(doc._data);
          });

          setUserList(prevUserList => myList);
        }
      } catch (err) {
        console.log(err);
      }
    };

    getUserList();
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;
    // console.log('get contacts');
    const getContacts = async () => {
      try {
        if (!isCancelled) {
          const androidContactPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
            {
              title: 'Contacts',
              message: 'This app would like to view your contacts.',
              buttonPositive: 'ok',
              buttonNeutral: 'ask me later',
              buttonNegative: 'cancel',
            },
          );

          if (androidContactPermission === PermissionsAndroid.RESULTS.GRANTED) {
            // console.log('contacts permission granted');
            Contacts.getAll()
              .then(response => {
                //show all contacts

                var list = [];
                response.forEach(contact => {
                  const temp = {};
                  temp.displayName = contact.displayName;
                  if (contact.phoneNumbers[0]?.number) {
                    temp.phoneNumber = contact.phoneNumbers[0]?.number.includes(
                      '+91',
                    )
                      ? contact.phoneNumbers[0]?.number
                      : '+91' + contact.phoneNumbers[0]?.number;
                  } else {
                    temp.phoneNumber = null;
                  }

                  temp.thumbnail = contact.thumbnailPath;
                  list.push(temp);
                });
                // setContacts(prevContacts => list);
                // const userList = setUserList(prevUserList);
                setUserList(prevUserList => {
                  //   console.log(prevUserList);
                  var filteredArray = prevUserList.filter(o =>
                    list.some(({phoneNumber}) => o.phoneNumber === phoneNumber),
                  );
                  return filteredArray;
                });

                setLoading(false);
              })
              .catch(err => {
                console.log(err);
              });
          }
        } else {
          console.log('contacts permission denied');
        }
      } catch (err) {
        console.log(err);
      }
    };

    getContacts();
    return () => {
      isCancelled = true;
    };
  }, []);

  const enterChat = async (userBDisplayName, userBUid) => {
    // console.log(`enter chat with ${userBDisplayName} with a uid of ${userBUid}`);

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

        if (
          (participants[0].uid === user.uid &&
            participants[1].uid === userBUid) ||
          (participants[1].uid === user.uid && participants[0].uid === userBUid)
        ) {
          isDuplicate = true;
          convId = conversation.conversationId;
        }

        if (isDuplicate) {
          isUnique = false;
        }
      });

      if (isUnique) {
        const conversationsRef = firestore().collection('Conversations');
        const result2 = await firestore()
          .collection('Users')
          .where('uid', '==', user.uid)
          .get();
        const creator = result2._docs[0]._data;

        const result3 = await firestore()
          .collection('Users')
          .where('uid', '==', userBUid)
          .get();
        const sideUser = result3._docs[0]._data;
        const participants = [creator, sideUser];

        const response = await firestore().collection('Conversations').add({
          participants: participants,
          messages: [],
          lastMessage: {},
          unSeenNumbers: 0,

          wallpaper: '',
        });

        conversationId = response.id;

        const docRef = await firestore()
          .collection('Conversations')
          .doc(conversationId);
        const result = docRef.update({
          conversationId: conversationId,
        });
        // console.log(result);
        const res1 = await firestore()
          .collection('Conversations')
          .doc(conversationId)
          .get();
        const conversation = res1._data;
        // console.log(conversation);
        // setConversations(prevConversations => [
        //   ...prevConversations,
        //   conversation,
        // ]);

        navigation.navigate('ChatScreen', {
          conversationId: conversationId,
          conversation: conversation,
        });
      } else {
        const result = await firestore()
          .collection('Conversations')
          .doc(convId)
          .get();
        const conversation = result._data;
        // console.log(conversation);

        navigation.navigate('ChatScreen', {
          conversationId: convId,
          conversation: conversation,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text numberOfLines={1} style={styles.title}>
        Contacts on Thunder
      </Text>
      {loading && <ActivityIndicator size={30} />}
      <ScrollView style={styles.contactsContainers}>
        {userList?.length === 0 && <Text>no contacts</Text>}
        {userList?.length > 0 &&
          userList?.map((contact, id) => {
            return (
              <TouchableOpacity
                key={id}
                onPress={() => enterChat(contact.displayName, contact.uid)}>
                <Contact contact={contact} />
              </TouchableOpacity>
            );
          })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default memo(ContactScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F1F1',
    // paddingTop: 30,
    // justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    color: 'black',
    fontFamily: 'Inter-Light',
    marginTop: 30,
  },
  contactsContainers: {
    // backgroundColor: 'blue',
    padding: 10,
    flex: 1,
    width: '90%',
    // alignItems: 'center',
  },
});
