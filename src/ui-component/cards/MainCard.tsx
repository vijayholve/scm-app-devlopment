import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import PropTypes from 'prop-types';

const MainCard = ({ title, children, style }) => {
  return (
    <SafeAreaView style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  );
};

MainCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  style: PropTypes.object,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Card background color
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  content: {
    flex: 1,
  },
});

export default MainCard;
