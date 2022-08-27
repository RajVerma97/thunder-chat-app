import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import CameraRoll from '@react-native-community/cameraroll';
import {PermissionsAndroid, Platform} from 'react-native';

const CameraRollModal = ({visible, setVisible}) => {
  const [data, setData] = useState([]);
  const [albums, setAlbums] = useState([]);
  // console.log('cameraroll modal updateing')

  useEffect(() => {
    const getAlbums = async () => {
      // console.log('get albums');
      try {
        const res = await CameraRoll.getAlbums({ assetType: 'All' });
        
        // setAlbums(prevAlbums => res);
        // console.log(res);
      } catch (err) {
        console.log(err);
      }
    };

    const hasAndroidPermission = async () => {
      const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
      const hasPermission = await PermissionsAndroid.check(permission);
      if (hasPermission) {
        return true;
      }
      const status = await PermissionsAndroid.request(permission);
      return status === 'granted';
    };

    if (Platform.OS === 'android' && hasAndroidPermission()) {
      getAlbums();
      // getPhotosByGroupName('screenshots');
    }
  }, [visible]);

  const getPhotosByGroupName = async groupName => {
    // console.log(groupName);
    CameraRoll.getPhotos({first: 50, groupName: groupName, assetType: 'All',groupTypes:'All'})
      .then(res => {
        var temp = [];
        res.edges.forEach(e => {
          const myData = {};
          myData.type = e.node.type;
          myData.uri = e.node.image.uri;
          temp.push(myData);
        });
        //  console.log(temp);
        setData(prevData => temp);
      })
      .catch(err => console.log(err));
  };

  const closeCameraRollModal = () => {
    setVisible(false);
  };

  const savePicture = async () => {
    if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
      return;
    }
    Cameraroll.save(tag, {type, album});
  };

  return (
    <Modal visible={visible} animationType={'fade'} transparent={true}>
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: 720,
          backgroundColor: 'black',
          flex: 1,
        }}>
        <TouchableOpacity onPress={() => closeCameraRollModal()}>
          <Text>close modal</Text>
        </TouchableOpacity>

        {albums && albums.length > 0 ? (
          <ScrollView>
            {albums.map((album, id) => {
              return (
                <TouchableOpacity
                  onPress={() => getPhotosByGroupName(album.title)}
                  key={id}>
                  <Text style={{fontSize: 30}}>{album.title}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <Text>no albums</Text>
        )}

        {data && data.length > 0 ? (
          <ScrollView
            style={{
              flex: 1,
              flexDirection: 'row',
              flexWrap: 'wrap',
              padding: 10,
            }}>
            {data.map((e, id) => {
              return (
                <TouchableOpacity key={id}>
                  <Image
                    resizeMode="contain"
                    style={{width: 100, height: 100, marginBottom: 20}}
                    source={{uri: e.uri}}></Image>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <Text> data is not </Text>
        )}
      </View>
    </Modal>
  );
};

export default CameraRollModal;

const styles = StyleSheet.create({});
