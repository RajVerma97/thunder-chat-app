import React from 'react';
import {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Button,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  PermissionsAndroid,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import ImagePicker from 'react-native-image-crop-picker';
import firebase from '@react-native-firebase/app';
import storage from '@react-native-firebase/storage';
import fireStore from '@react-native-firebase/firestore';
// import {LoginContext} from '../Context/LoginContext';
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

const ProfileScreen = props => {
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const uploadImage = async () => {
    const uri = profileImage;

    const filename = uri.substring(uri.lastIndexOf('/') + 1);
    const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;

    const task = storage().ref(filename).putFile(uploadUri);
    // set progress state
    task.on('state_changed', snapshot => {
      // setTransferred(
      //     Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 10000
      // );
    });
    try {
      await task;
    } catch (e) {
      console.error(e);
    }
    setProfileImage(null);
  };

  async function createProfile() {
    Keyboard.dismiss();
    setLoading(prevLoading => true);
    if (firstName && lastName && profileImage) {
      const userData = {
        displayName: `${firstName} ${lastName}`,
        photoURL: profileImage,
      };

      await firebase.auth().currentUser.updateProfile(userData);

      const loggedInUser = auth().currentUser;

      const user = {};
      user.uid = loggedInUser.uid;
      user.displayName = loggedInUser.displayName;
      user.photoURL = loggedInUser.photoURL;
      user.phoneNumber = loggedInUser.phoneNumber;
      user.lastSignInTime = loggedInUser.metadata.lastSignInTime;
      user.status = 'online';

      uploadImage();

      const firestore = firebase.firestore();

      // const userCollection = fireStore().collection('Users');

      const response = await fireStore()
        .collection('Users')
        .doc(user.uid)
        .set(user)
        .then(() => {})
        .catch(err => console.log(err));

      setLoading(prevLoading => false);

      navigation.navigate('AppStackScreen', {screen: 'WelcomeScreen'});
    } else {
      setLoading(prevLoading => false);
      if (!firstName) {
        setError(prevError => " first name can't be blank");
      } else if (!lastName) {
        setError(prevError => " last name can't be blank");
      } else if (!profileImage) {
        setError(prevError => ' choose a profile image');
      }
    }
  }

  const selectImage = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
    })
      .then(response => {
        const pickedImage = response;
        const pickedImagePath = response.path;
        // console.log(pickedImage);
        setProfileImage(pickedImagePath);
      })
      .catch(err => {
        console.log(err);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        {/* <TouchableOpacity
          // onPress={() =>
          //   // navigation.navigate('AuthStack', {screen: 'SplashScreen'})
          // }
        >
          <FeatherIcon
            style={styles.wrapper__backArrowIcon}
            name="chevron-left"
          />
        </TouchableOpacity> */}

        <Text style={styles.wrapper__title}> create profile</Text>
        <TouchableOpacity
          style={styles.profileImageContainer}
          onPress={selectImage}>
          {profileImage !== null ? (
            <Image
              style={styles.profileImage}
              source={{
                width: '100%',
                height: '100%',
                borderRadius: 50,
                uri: profileImage,
              }}
            />
          ) : (
            <FeatherIcon name="upload" style={styles.uploadIcon} />
          )}
        </TouchableOpacity>

        <TextInput
          value={firstName}
          onChangeText={text => setFirstName(text)}
          style={styles.input}
          placeholder="first name"
          placeholderTextColor={'#1E1E1E'}
        />
        <TextInput
          value={lastName}
          onChangeText={text => setLastName(text)}
          style={styles.input}
          placeholder="last name"
          placeholderTextColor={'#1E1E1E'}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}
        {loading && <ActivityIndicator size={40} />}

        {!loading && (
          <TouchableOpacity
            style={styles.createProfileBtn}
            onPress={() => {
              createProfile();
            }}>
            <Text style={styles.createProfileBtn__text}>continue</Text>
            <FeatherIcon style={styles.createProfileBtn__icon} name="send" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

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
    // height: 600,
    backgroundColor: colors.white,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
    padding: 20,
  },

  wrapper__backArrowIcon: {
    fontSize: 40,
    marginBottom: 30,
    color: '#000000',
    opacity: 0,
  },

  wrapper__title: {
    fontSize: 40,

    fontFamily: 'Inter-Bold',
    textTransform: 'capitalize',
    color: '#000000',
    marginBottom: 12,
    alignSelf: 'center',
    marginTop: 10,
  },

  profileImageContainer: {
    marginVertical: 30,
    // borderColor: 'red',
    // borderWidth: 5,
    width: 120,
    height: 120,
    borderRadius: 100,
    alignSelf: 'center',
    backgroundColor: colors.darkBlue,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  uploadIcon: {
    color: 'white',
    fontSize: 35,
  },

  input: {
    borderColor: colors.darkBlue,
    borderWidth: 1,
    borderRadius: 50,
    marginBottom: 20,
    fontSize: 20,
    fontFamily: 'Inter-Semibold',
    paddingHorizontal: 25,
    paddingVertical: 12,
    color: '#1E1E1E',
  },
  errorText: {
    // fontWeight: '100',
    fontFamily: 'Inter-Medium',
    fontSize: 22,
    color: '#E30928',
    marginBottom: 30,
  },

  createProfileBtn: {
    width: 180,
    height: 70,
    backgroundColor: colors.blue,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 20,
  },
  createProfileBtn__text: {
    fontWeight: '700',
    fontFamily: 'Inter-bold',
    fontSize: 22,
    color: colors.white,
  },

  createProfileBtn__icon: {
    fontSize: 22,
    color: colors.white,
    transform: [{rotate: '45deg'}],
  },
});

export default ProfileScreen;
