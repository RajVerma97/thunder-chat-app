import {
  View,
  Text,
  Button,
  SafeAreaView,
  StyleSheet,
  useContext
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {LoginContext} from '../Context/LoginContext';

const SplashScreen = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Text>Splash Screen</Text>
      <Text>th is is the best!!</Text>

      <Button
        title="enter"
        onPress={() => navigation.navigate('PhoneNumberScreen')}></Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SplashScreen;
