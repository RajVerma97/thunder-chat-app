import React, {useState, useLayoutEffect, useEffect} from 'react';
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
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import FeatherIcon from 'react-native-vector-icons/Feather';
import {NavigationContainer} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import {Linking} from 'react-native';

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
  const [switchValue, setSwitchValue] = useState(false);

  useLayoutEffect(() => {
    let isCancelled = false;

    const getUserProfileImageUrl = async () => {
      try {
        if (!isCancelled) {
          const response = await firestore()
            .collection('Users')
            .where('uid', '==', auth().currentUser.uid.toString())
            .get();
          const userDoc = response.docs[0]._data;
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
  }, [profileImageUrl]);

  return (
    <SafeAreaView style={styles.container}>
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

          <Text style={styles.profileDisplayName}>{user?.displayName}</Text>
        </View>
        {/* <DrawerItemList {...props} /> */}
        {/* <DrawerItemList {...props}></DrawerItemList> */}
        <View style={styles.drawerItemList}>
          <TouchableOpacity
            style={styles.drawerItem}
            onPress={() => navigation.navigate('WelcomeScreen')}>
            <FeatherIcon style={styles.drawerItem__icon} name="home" />

            <Text style={styles.drawerItem__text}>Home Screen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.drawerItem}
            onPress={() =>
              navigation.navigate('AppStackScreen', {
                screen: 'ContactScreen',
              })
            }>
            <FeatherIcon style={styles.drawerItem__icon} name="user" />

            <Text style={styles.drawerItem__text}>contacts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.drawerItem}
            onPress={() =>
              navigation.navigate('AppStackScreen', {
                screen: 'SettingsScreen',
              })
            }>
            <FeatherIcon style={styles.drawerItem__icon} name="settings" />

            <Text style={styles.drawerItem__text}>settings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.drawerItem}
            onPress={() =>
              Linking.openURL('https://github.com/RajVerma97/thunder-chat-app')
            }>
            <FeatherIcon style={styles.drawerItem__icon} name="github" />

            <Text style={styles.drawerItem__text}>github</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.drawerItem}>
            <FeatherIcon style={styles.drawerItem__icon} name="moon" />
            <Switch
              style={styles.switch}
              value={switchValue}
              trackColor={{false: 'black', true: 'grey'}}
              thumbColor={switchValue ? 'black' : 'lightgrey'}
              onValueChange={() => setSwitchValue(prev => !prev)}
            />

            {/* <Text style={styles.drawerItem__text}>theme</Text> */}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.drawerItem}
            onPress={() => auth().signOut()}>
            <FeatherIcon style={styles.drawerItem__icon} name="log-out" />

            <Text style={styles.drawerItem__text}>log out</Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>
      <Text>hey</Text>
    </SafeAreaView>
  );
};

export default CustomDrawer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
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
    fontFamily: 'Inter-Light',
    fontSize: 30,
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
