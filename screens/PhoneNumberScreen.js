import React, {useEffect, useState} from 'react';
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
  ActivityIndicator

} from 'react-native';
import VerifyOtpScreen from './VerifyOtpScreen';
import ProfileScreen from './ProfileScreen';
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
    if (phoneNumber.length == 0) {
      setError(null);
    }
    else if(phoneNumber.length == 10) {
      setError('valid number');
    } else {
      setError('invalid number');
      
    }
  },[phoneNumber])

  async function signIn(phoneNumber) {
    console.log('inside sign in func');
    try {
     

      if (phoneNumber.length == 10) {
        // setError(prevError => null);
        setLoading(prevLoading=>true)
        
        phoneNumber = '+91' + phoneNumber;
        const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
        setConfirm(prevConfirm=>confirmation);
        setLoading(prevLoading=>false)
        
        
      }
      else {
        // setError(prevError => 'invalid number');
        setLoading(prevLoading=>false)
        
      }
      

     
  
    
    } catch (error) {
      // setError(prevError=>error);
      setLoading(prevLoading => false);
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
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <TouchableOpacity onPress={()=>navigation.goBack()}>
        <FeatherIcon style={styles.wrapper__icon} name='chevron-left'/>


        </TouchableOpacity>
         
            <Text style={styles.wrapper__title}>phone number</Text>
            <Text style={styles.wrapper__leading}>we will send you a code to your phone number</Text>
            <View style={styles.card}>
              <View style={styles.card__left}>
                <Image style={styles.countryFlagImage}
                  source={require('../assets/images/indianFlag.jpg')} />
                <Text style={styles.countryCodeText}>+91</Text>

                

              </View>

              <View style={styles.card__right}>
                <TextInput
              style={styles.phoneNumberInput}
              autoFocus
              placeholder=''
              keyboardType={'number-pad'}
              placeholderTextColor={'#1E1E1E'}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              onSubmitEditing={()=>{ signIn(phoneNumber)}} />
              </View>


        </View>
      

        
        {error && 
          <Text style={[styles.card__errorText,error==='valid number'&&styles.card__successText]}>{error}</Text>
        }

        {loading && 
        <ActivityIndicator size={40} />
        }

        {
          !loading &&
           
           <TouchableOpacity
          style={styles.sendCodeBtn}
          onPress={() => signIn(phoneNumber)}>
          <Text style={styles.sendCodeBtn__text}>send code</Text>
          <FeatherIcon style={styles.sendCodeBtn__icon} name="send" />
        </TouchableOpacity>



        }


       
       


      </View>
     

     
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor:colors.darkBlue,
    justifyContent: 'center',
    alignItems: 'center',
    padding:10,
  },

  wrapper: {
    width: '100%',
    height: '90%',
    backgroundColor: colors.white,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
    // alignItems:'center'
    padding: 20,
  },
  wrapper__icon: {
    fontSize: 40,
    marginBottom: 40,
    color:'#000000'
    
  },
  wrapper__title: {
    fontSize: 40,
    fontWeight:'900',
    fontFamily: 'Inter-Bold',
    textTransform: 'capitalize',
    color: '#000000',
    marginBottom:12,   
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
    // flex: 1,
    // width:'100%',
    height:65,
    backgroundColor: 'white',
    borderRadius: 50,
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    elevation:5,
  },

  card__left: {
     flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 10,
    height: 40,
    marginRight:4,
    
    
  },
  countryFlagImage: {
    width: 20,
    height: 15,
    marginRight:10,
    
  },
  countryCodeText: {
    fontSize: 18,
    fontFamily:'Inter-Regular',
    color: 'black'
    
    
  },
  card__right: {
    flex:1,
    // borderWidth: 3,
    // borderColor: 'blue',
    
  },

  card__errorText: {
    fontWeight:'500',
    fontFamily:'Inter-Medium',
    fontSize: 20,
    color: '#E30928',
    marginBottom:50
  },

  card__successText: {
  color: 'green',
},

  phoneNumberInput: {
    //  borderWidth: 3,
    // borderColor: 'red',
    
    // width: '90%',
    fontSize: 27,
    fontFamily:'Inter-Regular',
    color: '#1E1E1E',
    height: 65,
 
    // padding:15,
    
  
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
    alignSelf:'center'
  
    
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
    transform:[{rotate:'45deg'}]
    
  },

  // screen: {
  //   flex: 1,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   backgroundColor: 'black',
  // },
  // input: {
  //   borderWidth: 2,
  //   borderColor: 'lightblue',
  //   width: 300,
  //   marginVertical: 30,
  //   fontSize: 25,
  //   padding: 10,
  //   borderRadius: 8,
  // },
  // text: {
  //   fontSize: 25,
  // },
});
