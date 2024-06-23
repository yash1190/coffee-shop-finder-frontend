import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, TextInput, SafeAreaView, Platform, StatusBar, Dimensions } from 'react-native';
import axios from 'axios';
import { useFonts, Raleway_400Regular, Raleway_700Bold, Raleway_600SemiBold } from '@expo-google-fonts/raleway';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { API_URL } from '@env';

const defaultImage = require('../assets/images/coffee-shop.jpg');

export default function IndexScreen({ navigation }) {
  const [shops, setShops] = useState([]);
  const [allShops, setAllShops] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState({});
  const [noResultsMessage, setNoResultsMessage] = useState('');

  let [fontsLoaded] = useFonts({
    Raleway_400Regular,
    Raleway_700Bold,
    Raleway_600SemiBold
  });

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async (query = '') => {
    try {
      const url = `${API_URL}/coffeeShops${query ? `/search?q=${query}` : ''}`;
      console.log('Fetching data from URL:', url); // Log the constructed URL
      const response = await axios.get(url);
      console.log('Shop Details Response:', response.data);

      if (response.data.length === 0) {
        setNoResultsMessage('No coffee shops found.\n Try searching again with a different name or keyword');
      } else {
        setNoResultsMessage('');
      }
      response.data.sort((a, b) => b.rating - a.rating);
      const filteredShops = response.data.filter(shop => shop.rating >= 4.7);
      const featuredShops = filteredShops.sort((a, b) => b.rating - a.rating);

      const sortedShops = query ? filteredShops.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())) : featuredShops;

      const shopsData = sortedShops.map(shop => ({
        ...shop,
        isFavorite: favorites[shop._id] || false
      }));

      setShops(shopsData);
      setAllShops(response.data);
      setError(null);
    } catch (error) {
      console.log('Axios Error:', error);
      setError(error.message);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    fetchShops(query);
  };

  const toggleFavorite = async (id) => {
    try {
      const updatedFavorites = { ...favorites };
      updatedFavorites[id] = !updatedFavorites[id];
      setFavorites(updatedFavorites);
      const updatedShops = shops.map(shop => {
        if (shop._id === id) {
          return {
            ...shop,
            isFavorite: updatedFavorites[id]
          };
        }
        return shop;
      });

      const updatedAllShops = allShops.map(allShops => {
        if (allShops._id === id) {
          return {
            ...allShops,
            isFavorite: updatedFavorites[id]
          };
        }
        return allShops;
      });

      setShops(updatedShops);
      setAllShops(updatedAllShops);
      const url = `${API_URL}/coffeeShops/${id}/favorite`;
      console.log('Updating favorite status at URL:', url);

      const response = await axios.put(url, { favorite: updatedFavorites[id] });
      console.log('Favorite Update Response:', response.data);

    } catch (error) {
      console.log('Error toggling favorite:', error);
    }
  };


  const renderShopItem = ({ item, index }) => {
    const windowWidth = Dimensions.get('window').width;
    const itemWidth = (windowWidth - 64) / 2;
    const isSecondColumn = index % 2 === 1;

    const uniqueCategories = [...new Set(item.products.map(product => product.category))];
    const reviewsCount = item.reviews ? item.reviews.length : '1,200';
    const shopDistance = item.distance ? item.distance.length : '2.5';

    return (
      <TouchableOpacity
        style={[
          styles.shopItem,
          { width: itemWidth, marginTop: isSecondColumn ? 30 : 0 }
        ]}
        onPress={() => navigation.navigate('ShopDetail', { id: item._id })}
      >
        {allShops.includes(item) && item.rating >= 4.7 && (
          <View style={styles.featuredLabel}>
            <Text style={styles.featuredLabelText}>Featured</Text>
          </View>
        )}
        <View style={styles.favoriteContainer}>
          <TouchableOpacity style={styles.favoriteButton} onPress={() => toggleFavorite(item._id)}>
            <Feather name="heart" size={20} color={item.isFavorite ? 'red' : '#003B40'} />
          </TouchableOpacity>
        </View>
        <Image source={item.image ? { uri: item.image } : defaultImage} style={styles.shopImage} />
        <View style={styles.shopInfo}>
          <Text style={styles.shopName}>{item.name}</Text>
          <Text style={styles.shopRating}>
            <Feather name="star" size={20} color="#FDCB6E" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewsText}>{reviewsCount} reviews</Text>
          </Text>
          <Text style={styles.shopDistance}>{shopDistance} miles</Text>
          <View style={styles.productCategories}>
            {uniqueCategories.map(category => (
              <Text key={category} style={styles.categoryText}>{category}</Text>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.profileIcon}>
            <Image
              source={{ uri: 'https://s3-alpha-sig.figma.com/img/a00f/069d/16d8518941bd557a00c429bf13e885da?Expires=1719792000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=L5goWRGNPK57BTDGqgtKp8p2j827s4tTe~k~Y6c6uiFFVm6nXFZUJ~wloduDScp3M9sFSyo~qvtQTwv4NM16tg8YF7kw3OlJpH470gZIGn1e~V-qs34i4GNpLy9AgFfP76BYMW5Zia2cB3nZd4UGY~bUW36BnMVf-pHEzgpEtJWTxFzJeQo6bL1EBDuVTmgPNti7ynXCi9~VZ2YQ8rSaKuOrjbXBAVW1tcpPPuvp9bRh1soPb~s5B5xBQLMPP2MepZvT1BLnrwc9~6HmWa09vQxtEvTl7R6cirMzI5ngyIL2Z8cZx8H8vAyCs4zzDCRTWQCJ1pgzjwm~MHMry9zLrg__' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerText}>Find a coffee shop</Text>
            <Text style={styles.headerText}>anywhere</Text>
          </View>
        </View>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Feather name="search" size={24} color="#A4ADAE" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
          <TouchableOpacity style={styles.filtersButton}>
            <FontAwesome name="sliders" size={30} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      {searchQuery !== '' ? (
        <>
          <Text style={styles.sectionTitle}>All Coffee Shops</Text>
          <Text style={styles.sectionSubTitle}>Showing highest rated coffee shops at the top</Text>
          {allShops.length === 0 && (
            <View style={styles.noResultsContainer}>
              <Feather name="meh" size={100} color="#003B40" />
              <Text style={styles.noResultsMessage}>{noResultsMessage}</Text>
            </View>
          )}
          {allShops.length > 0 && (
            <FlatList
              data={allShops}
              keyExtractor={item => item._id}
              renderItem={renderShopItem}
              numColumns={2}
              contentContainerStyle={styles.shopList}
            />
          )}
        </>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Featured Coffee Shops</Text>
          {error && <Text style={styles.errorText}>{error}</Text>}
          {noResultsMessage ? (
            <Text style={styles.noResultsMessage}>{noResultsMessage}</Text>
          ) : (
            <FlatList
              data={shops}
              keyExtractor={item => item._id}
              renderItem={renderShopItem}
              numColumns={2}
              contentContainerStyle={styles.shopList}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 16,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  headerContent: {
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  headerText: {
    fontSize: 30,
    color: '#003B40',
    fontFamily: 'Raleway_600SemiBold',
    alignSelf: 'flex-start',
    fontWeight: 'bold',
    ...Platform.select({
      ios: {
        lineHeight: 34,
      },
      android: {
        lineHeight: 32,
      }
    })
  },
  profileIcon: {
    width: 50,
    height: 50,
    borderRadius: 30,
    overflow: 'hidden',
    marginLeft: 16,
    alignSelf: 'flex-end'
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    marginTop: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    flex: 1,
    height: 56,
    paddingLeft: 16,
    paddingRight: 16,
    backgroundColor: '#EDF0EF',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontFamily: 'Raleway_400Regular',
    fontSize: 22,
    color: '#A4ADAE',
    ...Platform.select({
      ios: {
        lineHeight: 26,
        height: 56,
      },
      android: {
        lineHeight: 24,
        height: 60,
      }
    })
  },
  searchIcon: {
    marginRight: 12
  },
  filtersButton: {
    width: 58,
    height: 56,
    backgroundColor: '#003B40',
    borderRadius: 20,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#003B40',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    ...Platform.select({
      android: {
        elevation: 5,
      }
    })
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 6,
    marginBottom: 6,
    marginLeft: 16,
    color: '#003B40',
    fontFamily: 'Raleway_600SemiBold',
  },
  sectionSubTitle: {
    fontSize: 18,
    marginTop: 6,
    marginBottom: 6,
    marginLeft: 16,
    color: '#003B40',
    fontFamily: 'Raleway_400Regular',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  noResultsContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  noResultsMessage: {
    fontSize: 18,
    textAlign: 'center',
    color: '#003B40',
    marginTop: 20,
    fontFamily: 'Raleway_600SemiBold',
  },
  shopList: {
    ...Platform.select({
      ios: {
        lineHeight: 26,
        paddingHorizontal: 22,
      },
      android: {
        elevation: 5,
        paddingHorizontal: 22,
      }
    }),
    paddingVertical: 14,
  },
  shopItem: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    marginRight: 16,
    overflow: 'visible',
    position: 'relative',
  },
  shopImage: {
    width: '100%',
    height: 200,
    borderRadius: 20
  },
  shopInfo: {
    paddingTop: 14,
    paddingLeft: 4
  },
  shopName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#003B40',
    fontFamily: 'Raleway_700Bold',
  },
  shopRating: {
    flexDirection: 'row',
    alignItems: 'center',
    color: '#666',
    fontSize: 16,
    marginBottom: 4,
    fontFamily: 'Raleway_600SemiBold',
  },
  shopDistance: {
    fontSize: 16,
    color: '#003B40',
    fontFamily: 'Raleway_600SemiBold',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#003B40',
    fontFamily: 'Raleway_700Bold'
  },
  reviewsText: {
    fontSize: 14,
    marginBottom: 6,
    color: '#A4ADAE',
    fontFamily: 'Raleway_700Bold'
  },
  favoriteContainer: {
    position: 'absolute',
    top: -10,
    right: -10,
    zIndex: 1,
    backgroundColor: '#EDF0EF',
    borderRadius: 100,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#fff',
    borderWidth: 2,
  },
  favoriteButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productCategories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    ...Platform.select({
      ios: {
        borderRadius: 10,
        gap: 5
      },
      android: {
        borderRadius: 10,
        gap: 5
      }
    })
  },
  categoryText: {
    fontSize: 12,
    marginRight: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#ECF1EF',
    color: '#003B40',
    fontFamily: 'Raleway_400Regular',
  },
  featuredLabel: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FDCB6E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  featuredLabelText: {
    fontSize: 12,
    color: '#003B40',
    fontFamily: 'Raleway_600SemiBold',
  },
});
