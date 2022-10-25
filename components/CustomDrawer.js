import React, {useState, useLayoutEffect, useEffect, useContext} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Switch,
} from 'react-native';

import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import auth from '@react-native-firebase/auth';
import FastImage from 'react-native-fast-image';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import FeatherIcon from 'react-native-vector-icons/Feather';
import {NavigationContainer} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import {Linking} from 'react-native';
import {DarkModeContext} from '../Context/DarkModeContext';

var colors = {
  darkBlue: '#222831',
  blue: '#3E45DF',
  grey: '#F1F1F1',
  white: '#FFFFFF',
  red: '#E30928',
  pink: '#F6416C',
};

const CustomDrawer = props => {
  const navigation = useNavigation();

  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [user, setUser] = useState(null);
  const {darkMode, setDarkMode, toggleDarkMode} = useContext(DarkModeContext);

  useLayoutEffect(() => {
    let isCancelled = false;

    const getUserProfileImageUrl = async () => {
      try {
        if (!isCancelled) {
          const response = await firestore()
            .collection('Users')
            .doc(auth().currentUser.uid)
            .get();

          const userDoc = response._data;

          if (userDoc && userDoc.photoURL) {
            const photoURL = userDoc.photoURL;

            setUser(prevUser => userDoc);

            const filename = photoURL.split('Pictures/')[1];
            const url = await storage()
              .ref('/' + filename)
              .getDownloadURL();

            setProfileImageUrl(prevProfileImageUrl => url);
          }
        }
      } catch (err) {
        console.log(err);
      }
    };
    getUserProfileImageUrl();
    return () => {
      isCancelled = true;
    };
  }, [props]);

  return (
    <SafeAreaView
      style={[
        styles.container,
        darkMode ? styles.container__dark : styles.container__light,
      ]}>
      <DrawerContentScrollView {...props}>
        <View style={styles.profileContainer}>
          <FastImage
            style={styles.profileImage}
            source={{
              uri: profileImageUrl
                ? profileImageUrl
                : 'https://cdn-icons.flaticon.com/png/128/3177/premium/3177440.png?token=exp=1658665759~hmac=4e34310b6a73c6ead296625199738d20',
              cache: FastImage.cacheControl.immutable,
            }}
          />

          <Text
            numberOfLines={1}
            style={[
              styles.profileDisplayName,
              darkMode ? {color: '#EEEEEE'} : null,
            ]}>
            {user?.displayName}
          </Text>
        </View>
        {/* <DrawerItemList {...props} /> */}
        {/* <DrawerItemList {...props}></DrawerItemList> */}
        <View style={styles.drawerItemList}>
          <TouchableOpacity
            style={styles.drawerItem}
            onPress={() => navigation.navigate('WelcomeScreen')}>
            <FeatherIcon
              style={[
                styles.drawerItem__icon,
                darkMode ? {color: '#EEEEEE'} : null,
              ]}
              name="home"
            />

            <Text
              style={[
                styles.drawerItem__text,
                darkMode ? {color: '#EEEEEE'} : null,
              ]}>
              Home Screen
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.drawerItem}
            onPress={() =>
              navigation.navigate('AppStackScreen', {
                screen: 'ContactScreen',
              })
            }>
            <FeatherIcon
              style={[
                styles.drawerItem__icon,
                darkMode ? {color: '#EEEEEE'} : null,
              ]}
              name="user"
            />

            <Text
              style={[
                styles.drawerItem__text,
                darkMode ? {color: '#EEEEEE'} : null,
              ]}>
              contacts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.drawerItem}
            onPress={() =>
              navigation.navigate('AppStackScreen', {
                screen: 'SettingsScreen',
              })
            }>
            <FeatherIcon
              style={[
                styles.drawerItem__icon,
                darkMode ? {color: '#EEEEEE'} : null,
              ]}
              name="settings"
            />

            <Text
              style={[
                styles.drawerItem__text,
                darkMode ? {color: '#EEEEEE'} : null,
              ]}>
              settings
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.drawerItem}
            onPress={() =>
              Linking.openURL('https://github.com/RajVerma97/thunder-chat-app')
            }>
            <FeatherIcon
              style={[
                styles.drawerItem__icon,
                darkMode ? {color: '#EEEEEE'} : null,
              ]}
              name="github"
            />

            <Text
              style={[
                styles.drawerItem__text,
                darkMode ? {color: '#EEEEEE'} : null,
              ]}>
              github
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.drawerItem}>
            <FeatherIcon
              style={[
                styles.drawerItem__icon,
                darkMode ? {color: '#EEEEEE'} : null,
              ]}
              name={darkMode ? 'moon' : 'sun'}
            />
            <Switch
              style={styles.switch}
              value={darkMode}
              trackColor={{false: 'black', true: 'white'}}
              thumbColor={darkMode ? '#00ADB5' : '#EEEEEE'}
              onValueChange={() => toggleDarkMode()}
            />

            {/* <Text style={styles.drawerItem__text}>theme</Text> */}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.drawerItem}
            onPress={async () => {
              try {
                auth().signOut();
                await firestore()
                  .collection('Users')
                  .doc(auth().currentUser.uid)
                  .update({
                    status: firebase.firestore.FieldValue.serverTimestamp(),
                  });
              } catch (err) {
                console.log(err);
              }
            }}>
            <FeatherIcon
              style={[
                styles.drawerItem__icon,
                darkMode ? {color: '#EEEEEE'} : null,
              ]}
              name="log-out"
            />

            <Text
              style={[
                styles.drawerItem__text,
                darkMode ? {color: '#EEEEEE'} : null,
              ]}>
              log out
            </Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>
    </SafeAreaView>
  );
};

export default CustomDrawer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  container__light: {
    backgroundColor: colors.white,
  },
  container__dark: {
    backgroundColor: '#1E2022',
  },
  profileContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    elevation: 5,
  },
  profileDisplayName: {
    color: '#1E1E1E',
    fontFamily: 'Inter-Bold',
    fontSize: 25,
  },

  drawerItemList: {
    padding: 30,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  drawerItem__icon: {
    color: '#1E1E1E',
    fontSize: 22,
    marginRight: 30,
  },
  drawerItem__text: {
    color: '#1E1E1E',
    fontSize: 22,
    fontFamily: 'Inter-Semibold',
    textTransform: 'capitalize',
  },
  switch: {
    // backgroundColor: 'blue',
  },
});
