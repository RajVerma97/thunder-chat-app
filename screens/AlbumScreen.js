import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

const AlbumScreen = () => {
  return (
    <View>
      <Text>album screen</Text>
    </View>
  );
};

export default AlbumScreen;

const styles = StyleSheet.create({});

//   {
//     albums && albums.length > 0 ? (
//       <ScrollView>
//         {albums.map((album, id) => {
//           return (
//             <TouchableOpacity
//               onPress={() => getPhotosByGroupName(album.title)}
//               key={id}>
//               <Text style={{fontSize: 30}}>{album.title}</Text>
//             </TouchableOpacity>
//           );
//         })}
//       </ScrollView>
//     ) : (
//       <Text>no albums</Text>
//     );
//   }
