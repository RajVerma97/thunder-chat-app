import React from 'react';
import {useEffect} from 'react';
import AuthNavigation from './AuthNavigation';

import SplashScreen from 'react-native-splash-screen';
export default function App() {
  
  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return <AuthNavigation />;
}
