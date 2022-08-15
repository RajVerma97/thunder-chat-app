import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Button,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect} from 'react';
import {useState} from 'react';
import Contacts from 'react-native-contacts';
import {PermissionsAndroid} from 'react-native';
import {Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
import storage from '@react-native-firebase/storage';

import auth from '@react-native-firebase/auth';

const WelcomeScreen = props => {
  const navigation = useNavigation();
  const [contacts, setContacts] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [user, setUser] = useState(null);
  const [userList, setUserList] = useState(null);

  useEffect(() => {
    //fetch current user  details here

    firestore()
      .collection('Users')
      .where('uid', '==', auth().currentUser.uid.toString())
      .get()
      .then(response => {
        const userDoc = response.docs[0]._data;
        // console.log(userDoc);
        setUser(userDoc);
        if (user) {
          const fileName = user.photoURL.split('Pictures/')[1];

          storage()
            .ref('/' + fileName) //name in storage in firebase console
            .getDownloadURL()
            .then(url => {
              setProfileImageUrl(url);
            })
            .catch(e => console.log('Errors while downloading => ', e));
        }
      })
      .catch(err => {
        console.log(err);
      });

    //fetch all  other users in the dataabase

    firestore()
      .collection('Users')
      .where('uid', '!=', auth().currentUser.uid.toString())
      .get()
      .then(response => {
        // const userList = response.docs;
        const myList = [];
        response._docs.forEach(doc => {
          myList.push(doc._data);
        });

        setUserList(myList);
      })
      .catch(err => {
        console.log(err);
      });
  }, [user]);

  const getContacts = async () => {
    setLoading(true);
    try {
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
            setContacts(list);

            var filteredArray = userList.filter(o =>
              list.some(({phoneNumber}) => o.phoneNumber === phoneNumber),
            );

            setUserList(filteredArray);

            setLoading(false);
          })
          .catch(err => {
            console.log(err);
          });
      } else {
        console.log('contacts permission denied');
      }
    } catch (err) {
      console.log(err);
    }
  };

  const enterChat = async xUid => {
    try {
      //if a conversation between sender and receiver already exists
      var isDuplicate = false;
      let conversationId;
      // const result = await firestore()
      //   .collection('Conversations')
      //   .where('participants', '==', [user.uid, xUid])
      //   .get();

      // if (result._docs.length > 1) {
      //   isDuplicate = true;
      // }

      // if (!isDuplicate) {
        const conversationsRef = firestore().collection('Conversations');
        const response = await firestore()
          .collection('Conversations')
          .add({
            participants: [user.uid, xUid],
          });

        conversationId = response.id;

        const docRef = await firestore()
          .collection('Conversations')
          .doc(conversationId);
        const result = docRef.update({conversationId: conversationId});
        navigation.navigate('ChatScreen', {
          conversationId: conversationId,
          senderUid: user.uid,
          receiverUid: xUid,
        });
      // }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Welcome Screen</Text>
      <Text>Logged in as {auth().currentUser.displayName} </Text>
      {profileImageUrl && (
        <Image
          style={{width: 200, height: 200}}
          source={{uri: profileImageUrl}}
        />
      )}
      <Button title="sign out" onPress={() => auth().signOut()}></Button>
      <Button title="get contacts" onPress={() => getContacts()} />

      {userList ? (
        <ScrollView>
          {userList.length > 0 ? (
            <View>
              <Text>we have users list</Text>
              {userList.map((x, id) => {
                return (
                  <ScrollView key={id}>
                    <TouchableOpacity onPress={() => enterChat(x.uid)}>
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

      {loading ? (
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
