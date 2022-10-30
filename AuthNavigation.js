import React, {useState, useEffect, useRef} from 'react';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';

import PhoneNumberScreen from './screens/PhoneNumberScreen';
import VerifyOtpScreen from './screens/VerifyOtpScreen';
import ProfileScreen from './screens/ProfileScreen';
import SplashScreen from './screens/SplashScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import ChatScreen from './screens/ChatScreen';
import ContactScreen from './screens/ContactScreen';

import CustomDrawer from './components/CustomDrawer';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();
const ChatStack = createNativeStackNavigator();
import {DarkModeContext} from './Context/DarkModeContext';
import {LoginContext} from './Context/LoginContext';
import {ConversationsContext} from './Context/ConversationsContext';
import {AppState} from 'react-native';

const AuthStackScreen = () => (
  <AuthStack.Navigator initialRouteName="SplashScreen">
    <AuthStack.Screen
      name="SplashScreen"
      component={SplashScreen}
      options={{
        title: '',
        headerShown: false,
      }}
    />
    <AuthStack.Screen
      name="PhoneNumberScreen"
      component={PhoneNumberScreen}
      options={{
        title: '',
        headerShown: false,
      }}
    />
    <AuthStack.Screen
      name="VerifyOtpScreen"
      component={VerifyOtpScreen}
      options={{
        title: '',
        headerShown: false,
      }}
    />
  </AuthStack.Navigator>
);
const AppStackScreen = () => (
  <AppStack.Navigator>
    <AppStack.Screen
      name="WelcomeScreen"
      component={WelcomeScreen}
      options={{
        title: 'welcome screen',

        headerShown: true,
        headerStyle: {
          backgroundColor: '#1E2022',
        },
        headerTintColor: 'white',
        headerTintStyle: {
          fontWeight: 'bold',
        },
      }}
    />
    <AppStack.Screen
      name="ContactScreen"
      component={ContactScreen}
      options={{
        title: 'Contact Screen',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#1E2022',
        },
        headerTintColor: 'white',
        headerTintStyle: {
          fontWeight: 'bold',
        },
      }}
    />

    <AppStack.Screen
      name="ChatScreen"
      component={ChatScreen}
      options={{
        title: 'Chat Screen',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#1E2022',
        },

        headerTintColor: 'white',
        headerTintStyle: {
          fontWeight: 'bold',
        },
      }}
    />
  </AppStack.Navigator>
);

const AuthNavigation = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [darkMode, setDarkMode] = useState(false);
  const toggleDarkMode = () => {
    setDarkMode(prevDarkMode => !prevDarkMode);
  };

  // const [isDarkTheme, setIsDarkTheme] = useState(false);

  // // Fetch the current user's ID from Firebase Authentication.
  // const uid = firebase.auth().currentUser.uid;

  // // Create a reference to this user's specific status node.
  // // This is where we will store data about being online/offline.
  // const userStatusRef = firebase.database().ref('/status/' + uid);

  // // We'll create two constants which we will write to
  // // the Realtime database when this device is offline
  // // or online.
  // const isOfflineForDatabase = {
  //   state: 'offline',
  //   last_changed: firebase.database.ServerValue.TIMESTAMP,
  // };

  // const isOnlineForDatabase = {
  //   state: 'online',
  //   last_changed: firebase.database.ServerValue.TIMESTAMP,
  // };

  // // Create a reference to the special '.info/connected' path in
  // // Realtime Database. This path returns `true` when connected
  // // and `false` when disconnected.
  // firebase
  //   .database()
  //   .ref('.info/connected')
  //   .on('value', snapshot => {
  //     // If we're not currently connected, don't do anything.
  //     if (snapshot.val() == false) {
  //       return;
  //     }

  //     // If we are currently connected, then use the 'onDisconnect()'
  //     // method to add a set which will only trigger once this
  //     // client has disconnected by closing the app,
  //     // losing internet, or any other means.
  //     userStatusRef
  //       .onDisconnect()
  //       .set(isOfflineForDatabase)
  //       .then(() => {
  //         // The promise returned from .onDisconnect().set() will
  //         // resolve as soon as the server acknowledges the onDisconnect()
  //         // request, NOT once we've actually disconnected:
  //         // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect

  //         // We can now safely set ourselves as 'online' knowing that the
  //         // server will mark us as offline once we lose connection.
  //         userStatusRef.set(isOnlineForDatabase);
  //       });
  //   });

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      _handleAppStateChange,
    );
    return () => {
      subscription.remove();
    };
  }, []);
  const _handleAppStateChange = nextAppState => {
    if (
      appState.current.match('/inactive|background/') &&
      nextAppState === 'active'
    ) {
      // console.log('user is online');
    } else {
      // console.log('user is offline');
    }
    appState.current = nextAppState;
    setAppStateVisible(appState.current);
    // console.log('AppState', appState.current);
  };

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async user => {
      try {
        if (user) {
          setCurrentUser(user);
          // console.log(user);

          if (appStateVisible === 'active') {
            // const response = await firestore()
            //   .collection('Users')
            //  doc()
            //   .get();
            // console.log(response._docs[0]._data);
            // var myUser = response._docs[0]._data;
            // myUser.status = 'online';
            await firestore()
              .collection('Users')
              .doc(user.uid)
              .update({status: 'online'});
            // console.log('updated status');

            // console.log('online');
            // await firestore()
            //   .collection('Users')
            //   .doc(user.uid)
            //   .update({status: 'online'});
          } else if (appStateVisible === 'background') {
            await firestore().collection('Users').doc(user.uid).update({
              status: firebase.firestore.FieldValue.serverTimestamp(),
            });
            // console.log('offline');
            // await firestore()
            //   .collection('Users')
            //   .doc(user.uid)
            //   .update({status: 'offline'});
          }
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.log(err);
      }
    });
    return unsubscribe;
  });

  const screenOption = {
    headerShown: true,
  };

  return (
    <DarkModeContext.Provider value={{darkMode, setDarkMode, toggleDarkMode}}>
      <NavigationContainer>
        {!currentUser ? (
          <AuthStackScreen />
        ) : (
          <Drawer.Navigator
            initialRouteName="WelcomeScreen"
            drawerContent={props => <CustomDrawer {...props} />}>
            {!currentUser.displayName && (
              <Stack.Screen
                name="ProfileScreen"
                component={ProfileScreen}
                options={{
                  title: '',
                  headerShown: false,
                }}
              />
            )}

            <Drawer.Screen
              name="AppStackScreen"
              component={AppStackScreen}
              options={{
                title: 'Home Screen',
                headerShown: false,
                headerStyle: {
                  backgroundColor: '#222831',
                },
                headerTintColor: 'white',
              }}
            />
          </Drawer.Navigator>
        )}
      </NavigationContainer>
    </DarkModeContext.Provider>
  );
};

export default AuthNavigation;
