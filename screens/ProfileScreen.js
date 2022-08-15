import React, {useEffect} from 'react';
import {PermissionsAndroid} from 'react-native';
import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
// import {updateProfile} from '@react-native-firebase/auth'
import ImagePicker from 'react-native-image-crop-picker';
import firebase from '@react-native-firebase/app';
import storage from '@react-native-firebase/storage';
import fireStore from '@react-native-firebase/firestore';
import {useState} from 'react';
import {LoginContext} from '../Context/LoginContext';
import {useNavigation} from '@react-navigation/native';

const ProfileScreen = props => {
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

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

    uploadImage();

    const firestore = firebase.firestore();

    const userCollection = fireStore().collection('Users');

    userCollection
      .add(user)
      .then(() => {
        console.log('user added to firestore');
      })
      .catch(err => console.log(err));
    navigation.navigate('WelcomeScreen');
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
    <View style={styles.screen}>
      <View style={{marginTop: 30}}>
        <Button title="Signout" onPress={() => auth().signOut()} />
      </View>

      <Text style={styles.text}> Create Your Profile </Text>

      <View>
        <TouchableOpacity
          style={styles.profileImageContainer}
          onPress={selectImage}>
          {profileImage !== null ? (
            <Image
              source={{
                width: '100%',
                height: '100%',
                borderRadius: 50,
                uri: profileImage,
              }}
            />
          ) : (
            <Image
              source={{
                width: '100%',
                height: '100%',
                borderRadius: 50,
                uri: 'https://cdn-icons.flaticon.com/png/128/3177/premium/3177440.png?token=exp=1658665759~hmac=4e34310b6a73c6ead296625199738d20',
              }}
            />
          )}
        </TouchableOpacity>

        <TextInput
          value={firstName}
          onChangeText={text => setFirstName(text)}
          style={styles.input}
          placeholder="first name"
        />
        <TextInput
          value={lastName}
          onChangeText={text => setLastName(text)}
          style={styles.input}
          placeholder="last name"
        />
        <TouchableOpacity
          style={styles.createProfileBtn}
          onPress={() => {
            createProfile();
          }}>
          <Text style={styles.createProfileBtnText}>Create</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
    width: 200,
    marginVertical: 30,
    fontSize: 25,
    padding: 8,
    borderRadius: 8,
  },
  text: {
    fontSize: 25,
  },
  createProfileBtn: {
    width: 100,
    height: 50,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  createProfileBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'black',
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'grey',
  },
});

export default ProfileScreen;
