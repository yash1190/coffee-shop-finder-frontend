// FavoritesScreen.js

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';

const FavoritesScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.sectionTitle}>Favorites</Text>
      {/* Add your favorite items or content here */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
});

export default FavoritesScreen;
