import React, {useState, useRef} from 'react';
import {
  StyleSheet,
  Text,
  Image,
  View,
  Button,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
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

export default function VerifyOtpScreen(props) {
  const navigation = useNavigation();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [firstBox, setFirstBox] = useState(null);
  const [secondBox, setSecondBox] = useState(null);
  const [thirdBox, setThirdBox] = useState(null);
  const [fourthBox, setFourthBox] = useState(null);
  const [fifthBox, setFifthBox] = useState(null);
  const [sixthBox, setSixthBox] = useState(null);

  const firstBoxRef = useRef();
  const secondBoxRef = useRef();
  const thirdBoxRef = useRef();
  const fourthBoxRef = useRef();
  const fifthBoxRef = useRef();
  const sixthBoxRef = useRef();

  const sendCode = () => {
    Keyboard.dismiss();
    if (
      firstBox &&
      secondBox &&
      thirdBox &&
      fourthBox &&
      firstBox &&
      sixthBox
    ) {
      setLoading(prevLoading => true);
      const code =
        firstBox + secondBox + thirdBox + fourthBox + fifthBox + sixthBox;
      props.confirmVerificationCode(code, setError, setLoading);
    } else {
      setError('invalid otp');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FeatherIcon style={styles.wrapper__icon} name="chevron-left" />
        </TouchableOpacity>

        <Text style={styles.wrapper__title}>enter Otp</Text>
        <Text style={styles.wrapper__leading}>
          we have sent a code to your phone number
        </Text>
        <View style={styles.boxContainer}>
          <TextInput
            style={styles.box}
            ref={firstBoxRef}
            autofocus={true}
            placeholder=""
            placeholderTextColor={'#1E1E1E'}
            keyboardType="number-pad"
            value={firstBox}
            onChangeText={value => {
              setFirstBox(value);
              if (value) {
                secondBoxRef.current.focus();
              }
            }}
            maxLength={1}
            numberOfLines={1}
          />
          <TextInput
            style={styles.box}
            ref={secondBoxRef}
            placeholder=""
            placeholderTextColor={'#1E1E1E'}
            keyboardType="number-pad"
            value={secondBox}
            onChangeText={value => {
              setSecondBox(value);
              if (value) {
                thirdBoxRef.current.focus();
              }
              if (value.length == 0) {
                firstBoxRef.current.focus();
              }
            }}
            onKeyPress={()=>{console.log('hey')}}
            maxLength={1}
            numberOfLines={1}
          />
          <TextInput
            style={styles.box}
            placeholder=""
            ref={thirdBoxRef}
            placeholderTextColor={'#1E1E1E'}
            keyboardType="number-pad"
            value={thirdBox}
            onChangeText={value => {
              setThirdBox(value);
              if (value) {
                fourthBoxRef.current.focus();
              }
              if (value.length == 0) {
                secondBoxRef.current.focus();
              }
            }}
            maxLength={1}
            numberOfLines={1}
          />
          <TextInput
            style={styles.box}
            ref={fourthBoxRef}
            placeholder=""
            placeholderTextColor={'#1E1E1E'}
            keyboardType="number-pad"
            value={fourthBox}
            onChangeText={value => {
              setFourthBox(value);
              if (value) {
                fifthBoxRef.current.focus();
              }
              if (value.length == 0) {
                thirdBoxRef.current.focus();
              }
            }}
            maxLength={1}
            numberOfLines={1}
          />
          <TextInput
            style={styles.box}
            placeholder=""
            ref={fifthBoxRef}
            placeholderTextColor={'#1E1E1E'}
            keyboardType="number-pad"
            value={fifthBox}
            onChangeText={value => {
              setFifthBox(value);
              if (value) {
                sixthBoxRef.current.focus();
              }
              if (value.length == 0) {
                fourthBoxRef.current.focus();
              }
            }}
            maxLength={1}
            numberOfLines={1}
          />
          <TextInput
            style={styles.box}
            placeholder=""
            ref={sixthBoxRef}
            placeholderTextColor={'#1E1E1E'}
            keyboardType="number-pad"
            value={sixthBox}
            onChangeText={value => {
              setSixthBox(value);
              if (value.length == 0) {
                fifthBoxRef.current.focus();
              }
            }}
            maxLength={1}
            onSubmitEditing={() => {
              sendCode();
            }}
          />
        </View>

        {error && (
          <Text
            style={[
              styles.errorText,
              error === 'valid number' && styles.successText,
            ]}>
            {error}
          </Text>
        )}

        {loading && <ActivityIndicator size={40} />}

        {!loading && (
          <TouchableOpacity
            style={styles.verifyCodeBtn}
            onPress={() => {
              sendCode();
            }}>
            <Text style={styles.verifyCodeBtn__text}>verify code</Text>
            <FeatherIcon style={styles.verifyCodeBtn__icon} name="send" />
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
    backgroundColor: colors.grey,
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

  errorText: {
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    fontSize: 20,
    color: '#E30928',
    marginBottom: 50,
  },

  successText: {
    color: 'green',
  },

  boxContainer: {
    marginVertical: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  box: {
    backgroundColor: 'white',
    width: 45,
    height: 45,
    borderRadius: 8,
    textAlign: 'center',
    paddingVertical: 4,
    color: '#1E1E1E',
    fontSize: 24,
    fontWeight: '500',
    fontFamily: 'Inter-Regular',
    elevation: 4,
  },

  verifyCodeBtn: {
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
  verifyCodeBtn__text: {
    fontWeight: '700',
    fontFamily: 'Inter-bold',
    fontSize: 22,
    color: colors.white,
  },

  verifyCodeBtn__icon: {
    fontSize: 22,
    color: colors.white,
    transform: [{rotate: '45deg'}],
  },
});
