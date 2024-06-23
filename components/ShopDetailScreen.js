import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Linking, Animated } from 'react-native';
import axios from 'axios';
import { useFonts, Raleway_400Regular, Raleway_700Bold, Raleway_600SemiBold } from '@expo-google-fonts/raleway';
import { Feather } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { API_URL, GOOGLE_MAPS_API_KEY } from '@env';

const defaultImage = require('../assets/images/coffee-shop.jpg');

export default function ShopDetailScreen({ route, navigation }) {
  const [shop, setShop] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('coffee'); // Default category selection
  const [categoryEmpty, setCategoryEmpty] = useState(false); // State to track empty category
  const [googleMapsData, setGoogleMapsData] = useState(null); // State to store Google Maps data
  const [userLocation, setUserLocation] = useState(null); // State to store user's current location
  const { id } = route.params;

  let [fontsLoaded] = useFonts({
    Raleway_400Regular,
    Raleway_700Bold,
    Raleway_600SemiBold,
  });

  const coffeeIconScale = useState(new Animated.Value(1))[0];

  useEffect(() => {
    fetchShopDetails();
  }, [id]);

  useEffect(() => {
    if (fontsLoaded) {
      animateCoffeeIcon();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    getLocationAsync();
  }, []);

  const fetchShopDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/coffeeShops/${id}`);
      const shopDetails = response.data;

      console.log('Shop Details Response:', response.data);
      // Filter products based on selected category
      const filteredProducts = shopDetails.products.filter(product => product.category === selectedCategory);

      // Check if category is empty
      if (filteredProducts.length === 0) {
        setCategoryEmpty(true);
      } else {
        setCategoryEmpty(false);
      }

      setShop({
        ...shopDetails,
        products: filteredProducts
      });

      // Search address in Google Maps
      searchAddressInMaps(shopDetails.address);
    } catch (error) {
      console.log(error);
    }
  };

  const animateCoffeeIcon = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(coffeeIconScale, {
          toValue: 1.2, // Scale up to 1.2 times
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(coffeeIconScale, {
          toValue: 1, // Scale back to normal
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    fetchProducts(category);
  };

  const fetchProducts = async (category) => {
    try {
      const url = `${API_URL}/coffeeShops/${id}/products/${category}`;
      console.log('Fetching products from URL:', url); // Log the constructed URL

      const response = await axios.get(url);
      console.log('Products Response:', response.data);

      setShop(prevShop => ({
        ...prevShop,
        products: response.data,
      }));

      // Check if category is empty
      if (response.data.length === 0) {
        setCategoryEmpty(true);
      } else {
        setCategoryEmpty(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getLocationAsync = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setUserLocation(location.coords);
  };

  const searchAddressInMaps = async (address) => {
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: {
          address: address,
          key: GOOGLE_MAPS_API_KEY, // Replace with your Google Maps API key
        },
      });

      if (response.data.results.length > 0) {
        setGoogleMapsData(response.data.results[0]);
      } else {
        // No results found, default to Bengaluru, Karnataka
        setDefaultLocation();
      }
    } catch (error) {
      console.error('Error fetching data from Google Maps:', error);
      // Error occurred, default to Bengaluru, Karnataka
      setDefaultLocation();
    }
  };

  const setDefaultLocation = () => {
    // Set default location to Bengaluru, Karnataka
    setGoogleMapsData({
      formatted_address: 'Bengaluru, Karnataka, India',
      geometry: {
        location: {
          lat: 12.9716,
          lng: 77.5946,
        },
      },
    });
  };

  const openGoogleMaps = () => {
    if (googleMapsData) {
      const { formatted_address, geometry } = googleMapsData;
      const { location } = geometry;
      const url = `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;

      Linking.openURL(url);
    } else {
      console.log('No Google Maps data available.');
    }
  };

  if (!fontsLoaded || !shop) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View style={[styles.coffeeIconContainer, { transform: [{ scale: coffeeIconScale }] }]}>
          <Feather name="coffee" size={150} color="#003B40" />
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Feather name="chevron-left" size={28} color="#003B40" />
      </TouchableOpacity>
      <Image source={shop.image ? { uri: shop.image } : defaultImage} style={styles.shopImage} />
      <View style={styles.shopDetails}>
        <Text style={styles.shopName}>{shop.name}</Text>
        <Text style={styles.shopRating}>
          <Feather name="star" size={20} color="#FDCB6E" />{' '}
          <Text style={styles.ratingText}>{shop.rating}</Text>
          <Text style={styles.reviewsText}> · {shop.reviews} reviews</Text>
        </Text>
        <Text style={styles.shopAddress}>{shop.address}</Text>
        <TouchableOpacity
          style={styles.mapContainer}
          onPress={() => openGoogleMaps()}
        >
          {googleMapsData && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: googleMapsData.geometry.location.lat,
                longitude: googleMapsData.geometry.location.lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: googleMapsData.geometry.location.lat,
                  longitude: googleMapsData.geometry.location.lng,
                }}
                title={shop.name}
                description={shop.address}
              />
            </MapView>
          )}
          <TouchableOpacity
            style={styles.openMapsButton}
            onPress={() => openGoogleMaps()}
          >
            <Feather name="map-pin" size={24} color="#fff" />
          </TouchableOpacity>
        </TouchableOpacity>
        <View style={styles.categoryContainer}>
          <TouchableOpacity
            style={[styles.categoryItem, selectedCategory === 'coffee' && styles.activeCategory]}
            onPress={() => handleCategorySelect('coffee')}
          >
            <Feather name="coffee" size={24} color="#003B40" />
            <Text style={[styles.categoryText, selectedCategory === 'coffee' && styles.activeText]}>Coffee</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryItem, selectedCategory === 'drinks' && styles.activeCategory]}
            onPress={() => handleCategorySelect('drinks')}
          >
            <Feather name="droplet" size={24} color="#003B40" />
            <Text style={[styles.categoryText, selectedCategory === 'drinks' && styles.activeText]}>Drinks</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryItem, selectedCategory === 'food' && styles.activeCategory]}
            onPress={() => handleCategorySelect('food')}
          >
            <Feather name="pie-chart" size={24} color="#003B40" />
            <Text style={[styles.categoryText, selectedCategory === 'food' && styles.activeText]}>Food</Text>
          </TouchableOpacity>
        </View>
        {categoryEmpty ? (
          <Text style={styles.emptyCategoryMessage}>Sorry, No items in this category</Text>
        ) : (
          <FlatList
            style={styles.productList}
            contentContainerStyle={{ flexGrow: 1 }}
            data={shop.products}
            keyExtractor={item => item._id}
            renderItem={({ item }) => (
              <View style={styles.productContainer}>
                <Image source={item.image ? { uri: item.image } : defaultImage} style={styles.productImage} />
                <View style={styles.productDetails}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productDescription}>{item.description}</Text>
                  <Text style={styles.productPrice}>${item.price}</Text>
                </View>
                <TouchableOpacity style={styles.addButton}>
                  <Feather name="plus" size={30} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    fontFamily: 'Raleway_400Regular',
    position: 'relative', // Ensure map container is positioned relative to this view
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopImage: {
    width: '100%',
    height: 340,
    zIndex: 1, // Ensure shop image is below the map container
  },
  shopDetails: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    zIndex: 1,
    fontFamily: 'Raleway_400Regular',
    color: '#003B40',
    paddingBottom: 100,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    bottom: 40,
  },
  shopName: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Raleway_600SemiBold',
    color: '#003B40',
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  shopAddress: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: 'Raleway_600SemiBold',
    color: '#003B40',
    paddingHorizontal: 20,
  },
  shopRating: {
    fontSize: 16,
    marginBottom: 16,
    fontFamily: 'Raleway_600SemiBold',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  ratingText: {
    fontFamily: 'Raleway_600SemiBold',
  },
  reviewsText: {
    fontFamily: 'Raleway_700Bold',
    color: '#A4ADAE',
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
    height: 100,
    paddingHorizontal: 20,
  },
  categoryItem: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
  },
  activeCategory: {
    backgroundColor: '#ECF1EF',
  },
  categoryText: {
    marginTop: 8,
    fontFamily: 'Raleway_600SemiBold',
    color: '#003B40',
    textAlign: 'center',
    fontSize: 18,
  },
  activeText: {
    fontFamily: 'Raleway_600SemiBold',
    color: '#003B40',
  },
  emptyCategoryMessage: {
    fontSize: 18,
    color: '#003B40',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Raleway_400Regular',
  },
  productList: {
    marginTop: 20,
    overflow: 'visible',
  },
  productContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECF1EF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 30,
    position: 'relative',
    height: 140,
  },
  productImage: {
    width: 90,
    height: 110,
    borderRadius: 18,
    marginRight: 16,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Raleway_600SemiBold',
    paddingHorizontal: 5,
    paddingBottom: 8,
  },
  productDescription: {
    fontSize: 16,
    marginBottom: 4,
    fontFamily: 'Raleway_400Regular',
    paddingHorizontal: 5,
    paddingBottom: 10,
  },
  productPrice: {
    fontSize: 18,
    fontFamily: 'Raleway_600SemiBold',
    paddingHorizontal: 5,
  },
  addButton: {
    position: 'absolute',
    top: -14,
    right: -14,
    backgroundColor: '#003B40',
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#fff',
    zIndex: 1,
    padding: 6,
  },
  backButton: {
    position: 'absolute',
    top: 44,
    left: 26,
    backgroundColor: '#fff',
    borderRadius: 7,
    padding: 5,
    zIndex: 4,
  },
  mapContainer: {
    position: 'absolute',
    top: 30,
    right: 25,
    width: 80,
    height: 100,
    borderRadius: 10,
    overflow: 'hidden',
    zIndex: 1,
  },
  map: {
    flex: 1,
  },
  openMapsButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: '#003B40',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  openMapsText: {
    color: '#fff',
    marginLeft: 5,
    fontFamily: 'Raleway_400Regular',
  },
  coffeeIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
