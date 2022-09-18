import {StyleSheet, Text, View, Image} from 'react-native';
import React from 'react';

const Contact = props => {
  const contact = props.contact;
  return (
    <View style={styles.contact}>
      <Image
        style={styles.contact__profileImage}
        source={
          contact?.photoURL
            ? {uri: contact.photoURL}
            : require('../assets/images/uploadPhoto.png')
        }
      />
      <View style={styles.contact__info}>
        <Text style={styles.displayName}>{contact.displayName}</Text>
        <Text style={styles.phoneNumber}>{contact.phoneNumber}</Text>
      </View>
    </View>
  );
};

export default Contact;

const styles = StyleSheet.create({
  contact: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    borderRadius: 16,
  },
  contact__profileImage: {
    width: 60,
    height: 60,
    borderRadius: 100,
    marginRight: 20,
    resizeMode: 'contain',
  },
  displayName: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: 'black',
  },
  phoneNumber: {
    fontSize: 16,
    fontFamily: 'Inter-Light',
    color: '#6F6E77',
  },
});
