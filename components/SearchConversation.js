import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import React, {useState, useEffect} from 'react';
import FeatherIcon from 'react-native-vector-icons/Feather';
import FastImage from 'react-native-fast-image';
import DoubleCheck from '../components/DoubleCheck';

import moment from 'moment';
import auth from '@react-native-firebase/auth';

const SearchConversation = props => {
  const conversations = props.data;

  const foundMessage = props.foundMessage;
  const query = props.query;
  const [lastMessage, setLastMessage] = useState({});

  // const lastMessage = conversation.messages[conversation.messages.length - 1];
  useEffect(() => {
    let isMounted = true;
    // console.log('get messsages in chat screen ');
    const getMessages = async () => {
      try {
        if (isMounted) {
          // console.log(`conversation id: ${conversationId}`);
          firestore()
            .collection('Messages')
            .where('conversationId', '==', conversationId)
            .orderBy('createdAt', 'asc')
            .onSnapshot(snapshot => {
              if (snapshot && snapshot._docs) {
                // setMessages(snapshot._docs.map(doc => doc._data));
                var messages = [];
                snapshot._docs.map(doc => messages.push(doc._data));
                // console.log(messages);
                const lastMessage = messages[messages.length - 1];
                setLastMessage(lastMessage);
                // setText(lastMessage.text);
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
  }, [conversation]);
  var receiver;
  if (auth().currentUser.uid === conversation.participants[0].uid) {
    receiver = conversation.participants[1];
  } else {
    receiver = conversation.participants[0];
  }
  // console.log(receiver);

  return (
    <View style={styles.conversation}>
      <Image
        style={styles.conversation__image}
        source={
          receiver.photoURL
            ? {
                uri: receiver.photoURL,
                // cache: FastImage.cacheControl.immutable,
              }
            : require('../assets/images/user.png')
        }
      />
      {/* <Image
        style={styles.conversation__image}
        source={{
          uri: receiver.photoURL
            ? receiver.photoURL
            : 'https://cdn-icons.flaticon.com/png/128/3177/premium/3177440.png?token=exp=1658665759~hmac=4e34310b6a73c6ead296625199738d20',
        }}
      /> */}
      <View style={styles.conversation__middle}>
        <Text numberOfLines={1} style={styles.conversation__displayName}>
          {receiver.displayName}
        </Text>
        <View style={styles.conversation__middleBottom}>
          {foundMessage?.isRead ? (
            <DoubleChechk />
          ) : (
            <TouchableOpacity>
              <FeatherIcon
                style={styles.conversation__readStatusIcon}
                name="check"
              />
            </TouchableOpacity>
          )}
          {query.length === 0 ? (
            <Text numberOfLines={1} style={styles.conversation__lastMessage}>
              {lastMessage?.text}
            </Text>
          ) : (
            <Text numberOfLines={1} style={styles.conversation__lastMessage}>
              {foundMessage?.text}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.conversation__right}>
        {query.length === 0 && lastMessage?.createdAt && (
          <Text style={styles.conversation__time}>
            {moment(lastMessage?.createdAt?.seconds * 1000).format('HH:mm')}
          </Text>
        )}
        {query.length !== 0 && foundMessage?.createdAt && (
          <Text style={styles.conversation__time}>
            {moment(foundMessage?.createdAt?.seconds * 1000).format('HH:mm')}
          </Text>
        )}

        {/* {lastMessage?.senderUid && (
          <View style={styles.rightBottom}>
            {!(auth().currentUser.uid === lastMessage?.senderUid) &&
              getUnReadMessageCount() > 0 && (
                <View style={styles.unseenNumbersContainer}>
                  <Text style={styles.unseenNumbersContainer__text}>
                    {getUnReadMessageCount()}
                  </Text>
                </View>
              )}
          </View>
        )} */}
      </View>
    </View>
  );
};

export default SearchConversation;

const styles = StyleSheet.create({
  conversation: {
    backgroundColor: 'white',
    // elevation: 1,

    // borderColor: 'green',
    // borderWidth: 1,
    borderRadius: 16,
    flexDirection: 'row',
    // width: 300,
    // height: 80,
    // justifyContent: 'space-between',
    alignItems: 'center',
    // paddingHorizontal: 16,
    // padding: 15,
    paddingHorizontal: 12,
    paddingVertical: 12,

    // marginHorizontal: 16,
    marginBottom: 24,
  },
  conversation__image: {
    // borderColor: 'red',
    // borderWidth: 1,
    width: 60,
    height: 60,
    borderRadius: 50,
    resizeMode: 'contain',

    // marginRight: 12,
  },
  conversation__middle: {
    // borderColor: 'blue',
    // borderWidth: 1,
    flexDirection: 'column',

    flex: 1,

    marginLeft: 12,
    marginRight: 12,
  },
  conversation__displayName: {
    fontSize: 18,
    fontFamily: 'Inter-Semibold',
    color: 'black',
    // paddingBottom:4,
    // marginBottom: 4,
  },
  conversation__middleBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    // float: 'right',
  },
  conversation__readStatusIcon: {
    color: '#6F6E77',
    marginRight: 8,
  },
  conversation__lastMessage: {
    // borderColor: 'black',
    // borderWidth: 1,
    // width:150,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6F6E77',
    flex: 1,
  },
  conversation__right: {
    // borderColor: 'black',
    // borderWidth: 2,

    flexDirection: 'column',
  },
  conversation__time: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6F6E77',
    marginBottom: 12,
  },

  rightBottom: {
    // width: '100%',
    flexDirection: 'row',

    justifyContent: 'flex-end',
  },
  unseenNumbersContainer: {
    // alignSelf: 'center',
    width: 30,
    height: 30,
    borderRadius: 50,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unseenNumbersContainer__text: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'white',
  },
});
