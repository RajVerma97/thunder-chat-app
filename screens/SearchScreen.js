import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';

const SearchScreen = props => {
  const navigation = useNavigation();
  const route = useRoute();
  // var conversations = route.params.conversations;

  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);

  // useEffect(() => {
  //   const func = async () => {
  //     conversations.forEach(conversation => {
  //       //get the messages for teh conversation
  //       const conversationId = conversation.conversationId;

  //       // const response = await firestore()
  //       //   .collection('Messages')
  //       //   .where('conversationId', '==', conversationId)
  //       //   .orderBy('createdAt', 'asc')
  //       //   .get();
  //           // var messages = [];
  //           // if (snapshot && snapshot._docs) {
  //           //   snapshot._docs.map(doc => messages.push(doc._data));
  //           // }
  //           // // console.log(messages);

  //           // conversation.messages = messages;

  //     });
  //     console.log(conversations);
  //   };
  //   func();
  // }, []);

  // const search = searchText => {
  //   console.log('search for ' + searchText);
  // };

  return (
    <View style={styles.container}>
      <TextInput
        style={{
          width: '100%',
          backgroundColor: 'white',
          padding: 20,
          color: 'black',
        }}
        placeholder="search..."
        placeholderTextColor={'black'}
        value={searchText}
        onChangeText={t => setSearchText(t)}
        onSubmitEditing={() => search(searchText)}
      />
      <Text>search screen</Text>
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});
