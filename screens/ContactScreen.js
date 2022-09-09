import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import {PermissionsAndroid} from 'react-native';
import Contacts from 'react-native-contacts';
import {useNavigation} from '@react-navigation/native';

const ContactScreen = () => {
  const navigation = useNavigation();

  const [userList, setUserList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState('');
  const user = auth().currentUser;

  useEffect(() => {
    //fetch all other users in the database
    let isCancelled = false;
    const getUserList = async () => {
      try {
        if (!isCancelled) {
          console.log('get user list from db');

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
    console.log('get contacts');
    const getContacts = async () => {
      setLoading(true);
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
            console.log('contacts permission granted');
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
        const result2 = await firestore()
          .collection('Users')
          .where('uid', '==', userBUid)
          .get();
        const receiver = result2._docs[0]._data;
        const response = await firestore()
          .collection('Conversations')
          .add({
            participants: [user.displayName, userBDisplayName],
            receiverDisplayName: receiver.displayName,
            receiverPhotoUrl: receiver.photoURL,
            receiverUid: receiver.uid,
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
    <View style={styles.container}>
      {userList ? (
        <ScrollView>
          {userList.length > 0 ? (
            <View>
              <Text style={{fontSize: 26}}>Your contacts on Thunder</Text>
              {userList.map((x, id) => {
                return (
                  <ScrollView key={id}>
                    <TouchableOpacity
                      onPress={() => enterChat(x.displayName, x.uid)}>
                      <Image
                        style={{width: 50, height: 50}}
                        source={
                          x.photoURL
                            ? {uri: x.photoURL}
                            : {
                                uri: 'https://cdn-icons.flaticon.com/png/128/3177/premium/3177440.png?token=exp=1658665759~hmac=4e34310b6a73c6ead296625199738d20',
                              }
                        }
                      />
                      <Text>
                        {x.displayName} {x.phoneNumber}
                      </Text>
                    </TouchableOpacity>
                  </ScrollView>
                );
              })}
            </View>
          ) : (
            <Text>user list is empty</Text>
          )}
        </ScrollView>
      ) : (
        <Text>no list</Text>
      )}

      {/* {loading ? (
        <Text>loading...</Text>
      ) : (
        <ScrollView>
          {contacts.length > 0 ? (
            <View>
              <Text>we have contacts</Text>
              {contacts.map((contact, id) => {
                return (
                  <ScrollView key={id}>
                    <View>
                      <Image
                        style={{width: 50, height: 50}}
                        source={
                          contact.thumbnail
                            ? {uri: contact.thumbnail}
                            : {
                                uri: 'https://cdn-icons.flaticon.com/png/128/3177/premium/3177440.png?token=exp=1658665759~hmac=4e34310b6a73c6ead296625199738d20',
                              }
                        }
                      />
                      <Text>
                        {contact.displayName} {contact.phoneNumber}
                      </Text>
                    </View>
                  </ScrollView>
                );
              })}
            </View>
          ) : (
            <Text>no contacts</Text>
          )}
        </ScrollView>
      )} */}
    </View>
  );
};

export default ContactScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wrapper: {
    width: '90%',
    height: '90%',
    padding: 8,
    backgroundColor: 'lightgrey',
    color: 'black',
  },
});
