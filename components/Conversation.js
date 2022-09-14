import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import React from 'react';
import FeatherIcon from 'react-native-vector-icons/Feather';

const Conversation = props => {
  const conversation = props.conversation;
    return (
      
    <View style={styles.conversation}>
      <Image
        style={styles.conversation__image}
        source={{uri: conversation.receiverPhotoUrl}}
      />
      <View style={styles.conversation__middle}>
        <Text numberOfLines={1} style={styles.conversation__displayName}>
          {conversation.receiverDisplayName}
        </Text>
        <View style={styles.conversation__middleBottom}>
          <TouchableOpacity>
            <FeatherIcon
              style={styles.conversation__readStatusIcon}
              name="check"
            />
          </TouchableOpacity>
          <Text numberOfLines={1} style={styles.conversation__lastMessage}>
            {conversation.lastMessage}
          </Text>
        </View>
      </View>
      <View style={styles.conversation__right}>
        <Text style={styles.conversation__time}>09:32 PM</Text>
        <View style={styles.rightBottom}>
          <View style={styles.unseenNumbersContainer}>
            <Text style={styles.unseenNumbersContainer__text}>2</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Conversation;

const styles = StyleSheet.create({
  conversation: {
    backgroundColor: 'white',
    // elevation: 5,

    // borderColor: 'green',
    // borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    width: 300,
    height: 80,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,

    // marginHorizontal: 16,
    marginBottom: 24,
  },
  conversation__image: {
    // borderColor: 'red',
    // borderWidth: 1,
    width: 50,
    height: 50,
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
