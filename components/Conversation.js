import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import React from 'react';
import {useState, useEffect} from 'react';
import FeatherIcon from 'react-native-vector-icons/Feather';
import FastImage from 'react-native-fast-image';
import firestore from '@react-native-firebase/firestore';

import moment from 'moment';
import auth from '@react-native-firebase/auth';
import DoubleCheck from './DoubleCheck';

const Conversation = props => {
  const conversation = props.conversation;
  const conversationId = conversation.conversationId;
  const [lastMessage, setLastMessage] = useState({});
  const [unReadMessagesCount, setUnReadMessagesCount] = useState(0);

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
                if (messages.length !== 0) {
                  const lastMessage = messages[messages.length - 1];
                  console.log(lastMessage);
                  setLastMessage(lastMessage);
                }

                // setText(lastMessage.text);
                const unReadMessages = messages.filter(message => {
                  if (!message.isRead) {
                    return message;
                  }
                });
                const unReadMessagesCount = unReadMessages.length;
                setUnReadMessagesCount(unReadMessagesCount);
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

  // const lastMessage = messages[-1];

  var receiver;
  if (auth().currentUser.uid === conversation.participants[0].uid) {
    receiver = conversation.participants[1];
  } else {
    receiver = conversation.participants[0];
  }

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
            : require('../assets/images/uploadPhoto.png')
        }
      />

      <View style={styles.conversation__middle}>
        <Text numberOfLines={1} style={styles.conversation__displayName}>
          {receiver.displayName}
        </Text>

        <View style={styles.conversation__middleBottom}>
          {lastMessage.text || lastMessage.image || lastMessage.video ? (
            lastMessage.isRead ? (
              <DoubleCheck />
            ) : (
              <TouchableOpacity>
                <FeatherIcon
                  style={styles.conversation__readStatusIcon}
                  name="check"
                />
              </TouchableOpacity>
            )
          ) : null}

          {lastMessage.image ? (
            <Image
              style={styles.lastMsgImage}
              source={{uri: lastMessage?.image}}
            />
          ) : (
            <></>
          )}
          {lastMessage.video ? (
            <Text style={[styles.conversation__lastMessage, {color: 'blue'}]}>
              video
            </Text>
          ) : (
            <></>
          )}
          {lastMessage.text ? (
            <Text numberOfLines={1} style={styles.conversation__lastMessage}>
              {lastMessage?.text}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.conversation__right}>
        {lastMessage?.createdAt && (
          <Text style={styles.conversation__time}>
            {moment(lastMessage?.createdAt?.seconds * 1000).format('HH:mm')}
          </Text>
        )}

        <View style={styles.rightBottom}>
          {auth().currentUser.uid !== lastMessage?.senderUid ? (
            unReadMessagesCount > 0 && (
              <View style={styles.unseenNumbersContainer}>
                <Text style={styles.unseenNumbersContainer__text}>
                  {unReadMessagesCount}
                </Text>
              </View>
            )
          ) : (
            <></>
          )}
        </View>
      </View>
    </View>
  );
};

export default Conversation;

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

    marginLeft: 16,
    marginRight: 16,
  },
  conversation__displayName: {
    fontSize: 18,
    fontFamily: 'Inter-Semibold',
    color: 'black',

    // paddingBottom:4,
    // marginBottom: 4,
  },
  lastMsgImage: {
    width: 30,
    height: 30,
    // borderWidth: 5,
    borderColor: 'blue',
    borderRadius: 3,
    // borderColor: 'black',
    // borderWidth: 1,
    // marginTop:5,
    // padding: 20,
    // alignSelf:'flex-end'
    marginTop: 1,
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
