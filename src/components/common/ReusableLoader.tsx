import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

const ReusableLoader = ({ message = 'Loading...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6200EE" />
      <Text style={styles.messageText}>{message}</Text>
    </View>
  );
};

ReusableLoader.propTypes = {
  message: PropTypes.string
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  messageText: {
    marginTop: 10,
    fontSize: 16,
    color: '#000000',
  },
});

export default ReusableLoader;
