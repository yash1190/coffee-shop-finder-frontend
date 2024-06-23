import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Platform, StatusBar, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons'; // Import Feather icons
import { useFonts, Raleway_400Regular } from '@expo-google-fonts/raleway';
import * as SplashScreen from 'expo-splash-screen';

import HomeScreen from './components/IndexScreen';
import ShopDetailScreen from './components/ShopDetailScreen';
import ProfileScreen from './components/ProfileScreen'; // Import ProfileScreen
import SavedScreen from './components/SavedScreen'; // Import SavedScreen
import FavoritesScreen from './components/FavoritesScreen'; // Import FavoritesScreen

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

SplashScreen.preventAutoHideAsync();

const IndexTab = () => (
  <Stack.Navigator initialRouteName="Home">
    <Stack.Screen
      name="Index"
      component={HomeScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="ShopDetail"
      component={ShopDetailScreen}
      options={{
        headerShown: false,
        tabBarStyle: { display: 'none' }
      }}
    />
  </Stack.Navigator>
);

const App = () => {
  let [fontsLoaded] = useFonts({
    Raleway_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            size = 24;

            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'Favorites') {
              iconName = 'heart';
            } else if (route.name === 'Saved') {
              iconName = 'bookmark';
            } else if (route.name === 'Profile') {
              iconName = 'user';
            }

            return (
              <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
                <Feather name={iconName} size={size} color={focused ? '#fff' : color} />
              </View>
            );
          },
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#aaa',
          tabBarStyle: {
            backgroundColor: '#fff',
            height: 115,
            paddingHorizontal: 25,
            ...Platform.select({
              ios: {
                shadowOpacity: 0,
                shadowRadius: 0,
                borderTopColor: 'transparent',
              },
              android: {
                elevation: 0,
                borderTopColor: 'transparent',
              },
            }),
          },
          tabBarItemStyle: {
            paddingVertical: 0,
            paddingHorizontal: 0,
          },
        })}
      >
        <Tab.Screen name="Home" component={IndexTab} options={{
          headerShown: false,
        }} />
        <Tab.Screen name="Favorites" component={FavoritesScreen} options={{
          headerShown: false,
        }} />
        <Tab.Screen name="Saved" component={SavedScreen} options={{
          headerShown: false,
        }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{
          headerShown: false,
        }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  title: {
    fontSize: 25,
    color: 'black',
    fontFamily: 'Raleway_400Regular',
  },
  headerStyle: {
    height: Platform.OS === 'android' ? 100 : 80,
    backgroundColor: '#fff',
  },
  iconContainer: {
    width: 70,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 27,
  },
  iconContainerFocused: {
    backgroundColor: '#003B40',
    ...Platform.select({
      ios: {
        shadowColor: '#003B40',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
});

export default App;
