import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import React from 'react';
import {memo} from 'react';
import FeatherIcon from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';

const TopMenuModal = ({
  topMenuToggle,
  closeTopMenu,
  deleteAllMessages,
  changeTheme,
}) => {
  return (
    <View>
      <Modal visible={topMenuToggle} animationType={'fade'} transparent={true}>
        <TouchableOpacity
          onPress={() => closeTopMenu()}
          activeOpacity={1}
          style={{
            flex: 1,
            alignItems: 'flex-end',
          }}>
          <TouchableWithoutFeedback>
            <View style={styles.wrapper}>
              <TouchableOpacity
                style={styles.item}
                onPress={() => {
                  deleteAllMessages();
                  closeTopMenu();
                }}>
                <FeatherIcon style={styles.item__icon} name="trash" />
                <Text style={styles.item__text}>delete messages </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.item}
                onPress={() => {
                  changeTheme();
                  closeTopMenu();
                }}>
                <AntDesign style={styles.item__icon} name="picture" />
                <Text style={styles.item__text}>change wallpaper </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default memo(TopMenuModal);

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#222831',
    padding: 20,
    borderRadius: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
    marginBottom: 20,
    // borderWidth: 2,
    // borderColor: 'red',
  },
  item__icon: {
    marginRight: 12,
    fontSize: 16,
    color: 'white',
  },

  item__text: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'white',
  },
});
