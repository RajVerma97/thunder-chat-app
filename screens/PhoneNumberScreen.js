import React, {useState} from 'react';
import auth from '@react-native-firebase/auth';
import {StyleSheet, Text, View, Button, TextInput} from 'react-native';
import VerifyOtpScreen from './VerifyOtpScreen';
import ProfileScreen from './ProfileScreen';
import {useNavigation} from '@react-navigation/native';

export default function PhoneNumberScreen(props) {
  const navigation = useNavigation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);

  async function signIn(phoneNumber) {
    try {
      phoneNumber = '+91' + phoneNumber;
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      setConfirm(confirmation);
    } catch (error) {
      alert(error);
    }
  }

  async function confirmVerificationCode(code) {
    try {
      await confirm.confirm(code);
      setConfirm(null);
    } catch (error) {
      alert('Invalid code');
    }
  }



  if (confirm)
    return (
      <VerifyOtpScreen confirmVerificationCode={confirmVerificationCode} />
    );

  return (
    <View style={styles.screen}>
      <Text style={styles.text}>Enter Phone Number</Text>
      <TextInput
        autoFocus
        style={styles.input}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />
      <Button
        title="Phone Number Sign In"
        disabled={!phoneNumber}
        onPress={() => {
          signIn(phoneNumber);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  input: {
    borderWidth: 2,
    borderColor: 'lightblue',
    width: 300,
    marginVertical: 30,
    fontSize: 25,
    padding: 10,
    borderRadius: 8,
  },
  text: {
    fontSize: 25,
  },
});
