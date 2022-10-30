import React from 'react';
import { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import VerifyOtpScreen from './VerifyOtpScreen';
import {useNavigation} from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';

var colors = {
  darkBlue: '#222831',
  blue: '#3E45DF',
  grey: '#F1F1F1',
  white: '#FFFFFF',
  red: '#E30928',
  pink: '#F6416C',
};

export default function PhoneNumberScreen(props) {
  const navigation = useNavigation();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const [confirm, setConfirm] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      if (phoneNumber.length == 0 || phoneNumber.length < 10) {
        setError(null);
      } else if (phoneNumber.length == 10) {
        setError('valid number');
      } else if (phoneNumber.length > 10) {
        setError('invalid number');
      }
    }
    return () => {
      isMounted = false;
    };
  }, [phoneNumber]);

  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      const seconds = 15;
      const MAX_LOADING_TIME = seconds * 1000; //5 seconds
      if (loading) {
        setTimeout(() => {
          if (loading) {
            setLoading(false);
            setError('try after again later');
          }
        }, MAX_LOADING_TIME);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [loading]);

  async function signIn(phoneNumber) {
    try {
      if (phoneNumber.length == 10) {
        Keyboard.dismiss();
        setError(prevError => null);
        setLoading(prevLoading => true);

        phoneNumber = '+91' + phoneNumber;
        const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
        setConfirm(prevConfirm => confirmation);
        setLoading(prevLoading => false);
      } else {
        setError(prevError => 'invalid number');
        setLoading(prevLoading => false);
      }
    } catch (error) {
      setError(prevError => error);
      setLoading(prevLoading => false);
      alert(error);
    }
  }

  async function confirmVerificationCode(code, setError, setLoading) {
    try {
      await confirm.confirm(code);
      setLoading(prevLoading => false);
      setConfirm(prevConfirm => null);
    } catch (error) {
      setError(prevEror => 'invalid code');
      setLoading(prevLoading => false);
    }
  }

  if (confirm)
    return (
      <VerifyOtpScreen confirmVerificationCode={confirmVerificationCode} />
    );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FeatherIcon style={styles.wrapper__icon} name="chevron-left" />
        </TouchableOpacity>

        <Text style={styles.wrapper__title}>phone number</Text>
        <Text style={styles.wrapper__leading}>
          we will send you a code to your phone number
        </Text>
        <View style={styles.card}>
          <View style={styles.card__left}>
            <Image
              style={styles.countryFlagImage}
              source={require('../assets/images/indianFlag.jpg')}
            />
            <Text style={styles.countryCodeText}>+91</Text>
          </View>

          <View style={styles.card__right}>
            <TextInput
              style={styles.phoneNumberInput}
              autoFocus
              placeholder=""
              keyboardType={'number-pad'}
              placeholderTextColor={'#1E1E1E'}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              onSubmitEditing={() => {
                signIn(phoneNumber);
              }}
            />
          </View>
        </View>

        {error && (
          <Text
            style={[
              styles.card__errorText,
              error === 'valid number' && styles.card__successText,
            ]}>
            {error}
          </Text>
        )}

        {loading && <ActivityIndicator size={40} />}

        {!loading && error !== 'invalid number' && (
          <TouchableOpacity
            style={styles.sendCodeBtn}
            onPress={() => signIn(phoneNumber)}>
            <Text style={styles.sendCodeBtn__text}>send code</Text>
            <FeatherIcon style={styles.sendCodeBtn__icon} name="send" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBlue,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },

  wrapper: {
    width: '100%',
    height: 550,
    backgroundColor: colors.white,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
    padding: 20,
  },
  wrapper__icon: {
    fontSize: 40,
    marginBottom: 40,
    color: '#000000',
  },
  wrapper__title: {
    fontSize: 40,
    fontWeight: '900',
    fontFamily: 'Inter-Bold',
    textTransform: 'capitalize',
    color: '#000000',
    marginBottom: 12,
  },
  wrapper__leading: {
    fontSize: 16,
    fontWeight: '300',
    fontFamily: 'Inter-Regular',
    textTransform: 'lowercase',
    color: '#6F6E77',
  },

  card: {
    marginVertical: 40,

    height: 65,
    backgroundColor: 'white',
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    elevation: 5,
  },

  card__left: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 10,
    height: 40,
    marginRight: 4,
  },
  countryFlagImage: {
    width: 20,
    height: 15,
    marginRight: 10,
  },
  countryCodeText: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: 'black',
  },
  card__right: {
    flex: 1,
  },

  card__errorText: {
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    fontSize: 20,
    color: '#E30928',
    marginBottom: 40,
  },

  card__successText: {
    color: 'green',
  },

  phoneNumberInput: {
    fontSize: 27,
    fontFamily: 'Inter-Regular',
    color: '#1E1E1E',
    height: 65,
  },
  sendCodeBtn: {
    width: 180,
    height: 70,
    backgroundColor: colors.blue,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 50,
    alignSelf: 'center',
  },
  sendCodeBtn__text: {
    fontWeight: '700',
    fontFamily: 'Inter-bold',
    fontSize: 22,
    color: colors.white,
  },

  sendCodeBtn__icon: {
    fontSize: 22,
    color: colors.white,
    transform: [{rotate: '45deg'}],
  },
});
