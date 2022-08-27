import { StyleSheet, Text, View } from "react-native";
import React from "react";

const ImageScreen = () => {
  return (
    <View>
      <Text>image screen</Text>
    </View>
  );
};

export default ImageScreen;

const styles = StyleSheet.create({});

// {
//   data && data.length > 0 ? (
//     <ScrollView
//       style={{
//         flex: 1,
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         padding: 10,
//       }}>
//       {data.map((e, id) => {
//         return (
//           <TouchableOpacity key={id}>
//             <Image
//               resizeMode="contain"
//               style={{width: 100, height: 100, marginBottom: 20}}
//               source={{uri: e.uri}}></Image>
//           </TouchableOpacity>
//         );
//       })}
//     </ScrollView>
//   ) : (
//     <Text> data is not </Text>
//   );
// }
