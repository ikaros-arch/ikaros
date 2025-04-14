import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  buttonContainer: {
    marginVertical: 10,
  }
});

const SurveyMap = () => {
  const handlePress = (buttonNumber) => {
    console.log(`Button ${buttonNumber} clicked!`);
  };

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5, 6].map((buttonNumber) => (
        <View key={buttonNumber} style={styles.buttonContainer}>
          <Button
            title={`Button ${buttonNumber}`}
            onPress={() => handlePress(buttonNumber)}
          />
        </View>
      ))}
    </View>
  );
};

export default SurveyMap;
