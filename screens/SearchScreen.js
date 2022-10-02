import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState, useLayoutEffect} from 'react';
import {useNavigation, useRoute, isFocused} from '@react-navigation/native';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Conversation from '../components/Conversation';
import SearchConversation from '../components/SearchConversation';

const SearchScreen = props => {
  const navigation = useNavigation();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  // useEffect(() => {
  //   setConversations(convs);
  // }, []);

  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);

  console.log('from search screen');
  //  console.log(conversations);
  const [foundMessage, setFoundMessage] = useState('');

  // useEffect(() => {
  //   if (searchText.length == 0) {
  //     setConversations(convs);
  //   }
  // }, [searchText]);
  useLayoutEffect(() => {
    console.log('get conversations inside search screen');
    setLoading(prevLoading => true);
    let isCancelled = false;
    const getConversations = async () => {
      try {
        if (!isCancelled) {
          // console.log('i got it');

          const conversations = await firestore()
            .collection('Conversations')
            .get();

          let temp = [];
          conversations._docs.filter(doc => {
            try {
              const conversation = doc._data;
              // console.log(conversation);

              if (
                conversation.participants[0].uid === auth().currentUser.uid ||
                conversation.participants[1].uid === auth().currentUser.uid
              ) {
                temp.push(conversation);
                // console.log(conversation.participants);
              }
            } catch (err) {
              console.log(err);
            }
          });

          // console.log(temp);
          setConversations(prevConversations => temp);
          setLoading(prevLoading => false);
        }
      } catch (err) {
        console.log(err);
      }
    };

    getConversations();

    return () => {
      isCancelled = true;
    };
  }, []);

  const search = async data => {
    console.log('search for ' + query);
    query = query.toLowerCase();
    console.log('query' + query);
    // var temp = [];
    //  const conversations = await firestore()
    //         .collection('Conversations')
    //         .get();

    // setConversations(prevConversations =>
    //   prevConversations.filter(conversation => {
    //     if (
    //       conversation.participants[0].displayName
    //         .toLowerCase()
    //         .includes(query) ||
    //       conversation.participants[1].displayName.toLowerCase().includes(query)
    //     ) {
    //       return conversation;
    //       temp.push(conversation);
    //     }
    //     let isFound = false;
    //     conversation.messages.filter(message => {
    //       if (message.text.toLowerCase().includes(query)) {
    //         isFound = true;
    //         setFoundMessage(prevFoundMessage => message);
    //       }
    //     });
    //     if (isFound) {
    //       return conversation;
    //     }
    //   }),
    // );
  };

  const enterChat = async (conversationId, conversation) => {
    // console.log('enter room:' + conversationId);
    try {
      navigation.navigate('ChatScreen', {
        conversationId: conversationId,
        conversation: conversation,
      });
    } catch (err) {
      console.log(err);
    }
  };

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
        // onChangeText={t => {
        //   setSearchText(t);
        //   search(t);
        // }}
        // onSubmitEditing={() => search(searchText)}
      />
      {loading && <ActivityIndicator size={30} />}
      <ScrollView style={styles.conversationContainer}>
        {conversations.length > 0 &&
          conversations.map((conversation, index) => {
            return (
              <TouchableOpacity
                key={index}
                onPress={() =>
                  enterChat(conversation.conversationId, conversation)
                }>
                <SearchConversation
                  foundMessage={foundMessage}
                  query={searchText}
                  conversations={search(conversations)}
                />
              </TouchableOpacity>
            );
            return;
          })}
      </ScrollView>
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'grey',
  },
  conversationContainer: {
    padding: 20,
  },
});
