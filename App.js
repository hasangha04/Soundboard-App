import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Text,Alert, TouchableWithoutFeedback, Keyboard, Animated,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

const soundBoard = [
  require('./assets/Right_Answer_Vito.mp3'),
  require('./assets/150_Bucks.mp3'),
  require('./assets/Waterphone.mp3'),
  require('./assets/Among_Us.mp3'),
  require('./assets/Among_Us_Report.mp3'),
  require('./assets/Vine_Boom.mp3'),
  require('./assets/Hadouken.mp3'),
  require('./assets/I_Know_Youre_Gonna_Dig_This.mp3'),
  require('./assets/Perfect.mp3'),
  require('./assets/Spongebob.mp3'),
  require('./assets/Squid.mp3'),
  require('./assets/Burger.mp3'),
  require('./assets/Womp_Womp.mp3'),
  require('./assets/Tape_Rewind.mp3'),
  require('./assets/Losing_Horn.mp3'),
  require('./assets/Loco.mp3'),
  require('./assets/Mr.Albert.mp3'),
  require('./assets/We_Do_Not_Care.mp3'),
  require('./assets/Jidion.mp3'),
  require('./assets/Barnacles.mp3'),
  require('./assets/Bring_Me_My_Money.mp3'),
];

const buttonImages = [
  require('./assets/Right_Answer_Vito.png'),
  require('./assets/FZ150.jpg'),
  require('./assets/Waterphone.jpg'),
  require('./assets/Among_Us.png'),
  require('./assets/Among_Us_Report.png'),
  require('./assets/Vine_Boom.png'),
  require('./assets/Hadouken.png'),
  require('./assets/I_Know_Youre_Gonna_Dig_This.jpg'),
  require('./assets/Perfect.png'),
  require('./assets/Spongebob.png'),
  require('./assets/Squid.jpg'),
  require('./assets/Burger.jpg'),
  require('./assets/Trombone.png'),
  require('./assets/Tape_Rewind.png'),
  require('./assets/Losing_Horn.png'),
  require('./assets/kaplan.webp'),
  require('./assets/Albert.png'),
  require('./assets/Mike_Tomlin.jpg'),
  require('./assets/Jidion.png'),
  require('./assets/Barnacles.png'),
  require('./assets/Money.png'),
];

export default function App() {
  const [buttons, setButtons] = useState([]);
  const [longPressedButtonIndex, setLongPressedButtonIndex] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    retrieveButtons();
  }, []);

  useEffect(() => {
    saveButtons();
  }, [buttons]);

  const saveButtons = async () => {
    try {
      await AsyncStorage.setItem('buttons', JSON.stringify(buttons));
    } catch (error) {
      console.log('Error saving buttons:', error);
    }
  };

  const retrieveButtons = async () => {
    try {
      const storedButtons = await AsyncStorage.getItem('buttons');
      if (storedButtons) {
        setButtons(JSON.parse(storedButtons));
      }
    } catch (error) {
      console.log('Error retrieving buttons:', error);
    }
  };

  const handlePlaySound = async (buttonIndex) => {
    const soundObj = new Audio.Sound();
    try {
      let source;
      if (buttonIndex < soundBoard.length) {
        source = soundBoard[buttonIndex];
      } else {
        const dynamicButtonIndex = buttonIndex - soundBoard.length;
        source = buttons[dynamicButtonIndex].audio;
      }

      await soundObj.loadAsync(source);
      await soundObj.playAsync();
      const soundDuration = await soundObj.getStatusAsync();
      setTimeout(() => {
        soundObj.unloadAsync();
      }, soundDuration.durationMillis);
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditButton = async (buttonIndex) => {
    try {
      const audioFile = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
      });

      if (audioFile.type === 'success') {
        const imageFile = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        });

        if (!imageFile.canceled) {
          const imageUri = imageFile.assets[0];

          setButtons((prevButtons) => {
            const updatedButtons = [...prevButtons];
            const dynamicButtonIndex = buttonIndex - soundBoard.length;
            updatedButtons[dynamicButtonIndex] = {
              audio: { uri: audioFile.uri },
              image: { uri: imageUri },
            };
            return updatedButtons;
          });
        }
      }
    } catch (error) {
      console.log('Error selecting file:', error);
    }
  };

  const handleDeleteButton = (buttonIndex) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this button?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setButtons((prevButtons) => {
              const updatedButtons = [...prevButtons];
              if (buttonIndex < soundBoard.length) {
                updatedButtons.splice(buttonIndex, 1);
              } else {
                const dynamicButtonIndex = buttonIndex - soundBoard.length;
                if (dynamicButtonIndex >= 0 && dynamicButtonIndex < updatedButtons.length) {
                  updatedButtons.splice(dynamicButtonIndex, 1);
                }
              }
              return updatedButtons;
            });
          },
        },
      ]
    );
  };

  const handleAddButton = async () => {
    try {
      const audioFile = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
      });

      if (audioFile.type === 'success') {
        const imageFile = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        });

        if (!imageFile.canceled) {
          const newButton = {
            audio: { uri: audioFile.uri },
            image: { uri: imageFile.uri },
          };

          setButtons((prevButtons) => [...prevButtons, newButton]);
        }
      }
    } catch (error) {
      console.log('Error selecting file:', error);
    }
  };

  const handleOverlayDismiss = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => setLongPressedButtonIndex(null));
  };

  return (
    <TouchableWithoutFeedback onPress={handleOverlayDismiss}>
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor="#313131" />
        <ScrollView contentContainerStyle={styles.buttonContainer}>
          {soundBoard.map((button, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.button, { width: buttonImages[index].width }]}
              onPress={() => handlePlaySound(index)}
              onLongPress={() => {
                setLongPressedButtonIndex(index);
                fadeAnim.setValue(1); // Reset fade animation value
              }}
            >
              <Image source={buttonImages[index]} style={styles.buttonImage} />
              {longPressedButtonIndex === index && (
                <Animated.View
                  style={[
                    styles.buttonOptions,
                    { opacity: fadeAnim },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditButton(index)}
                  >
                    <Text style={styles.buttonOptionText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteButton(index)}
                  >
                    <Text style={styles.buttonOptionText}>Delete</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </TouchableOpacity>
          ))}
  
          {buttons.map((button, index) => (
            <TouchableOpacity
              key={index + soundBoard.length}
              style={[styles.button, { width: 100 }]}
              onPress={() => handlePlaySound(index + soundBoard.length)}
              onLongPress={() => {
                setLongPressedButtonIndex(index + soundBoard.length);
                fadeAnim.setValue(1); // Reset fade animation value
              }}
            >
              <Image source={{ uri: button.image.uri }} style={styles.buttonImage} />
              {longPressedButtonIndex === index + soundBoard.length && (
                <Animated.View
                  style={[
                    styles.buttonOptions,
                    { opacity: fadeAnim },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditButton(index + soundBoard.length)}
                  >
                    <Text style={styles.buttonOptionText}>Edit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteButton(index + soundBoard.length)}
                  >
                    <Text style={styles.buttonOptionText}>Delete</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.addButton} onPress={handleAddButton}>
          <Text style={styles.addButtonText}>➕</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#313131',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingLeft: 25,
    
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgb(21, 21, 21)',
    borderRadius: 10,
    borderColor: 'black',
    height: 40,
    margin: 10,
    paddingTop: 50,
    paddingBottom: 50,
  },
  buttonImage: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'black',
    borderWidth: 3,
    borderRadius: 10,
  },
  buttonOptions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonOptionText: {
    color: 'white',
    fontSize: 18,
  },
  editButton: {
    marginBottom: 10,
  },
  deleteButton: {
    marginTop: 10,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgb(21, 21, 21)',
    width: 60,
    height: 60,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 30,
    fontWeight: 'bold',
  },
});

