import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, TextInput, FlatList } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { MapPin, Search, Navigation as NavIcon } from 'lucide-react-native';
import axios from 'axios';

// Use your machine's local IP address so the simulator/device can find the server
const API_URL = 'http://10.10.0.153:5001/api';

export default function MapScreen({ navigation }) {
    const [location, setLocation] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc.coords);
        })();
    }, []);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            // Search our backend for tagged locations
            const response = await axios.get(`${API_URL}/locations/search`, {
                params: { city: searchQuery } // Simple city-based search for now
            });
            setPlaces(response.data);

            // If we found places, move map to first one
            if (response.data.length > 0) {
                const first = response.data[0];
                // You would use a map reference here to animateToRegion
            }
        } catch (error) {
            console.error('Search failed:', error);
            alert('Search failed. Make sure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {location ? (
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: location.latitude,
                        longitude: location.longitude,
                        latitudeDelta: 0.1,
                        longitudeDelta: 0.1,
                    }}
                    showsUserLocation={true}
                >
                    {places.map((place) => (
                        <Marker
                            key={place.placeId}
                            coordinate={{
                                latitude: place.coordinates?.lat || location.latitude,
                                longitude: place.coordinates?.lng || location.longitude
                            }}
                            title={place.name}
                            description={`${place.averageRating}⭐ - Tagged: ${place.userTags?.[0]?.tag || 'None'}`}
                            onPress={() => navigation.navigate('Review', { placeId: place.placeId, name: place.name })}
                        />
                    ))}
                </MapView>
            ) : (
                <View style={styles.loading}>
                    <Text>Fetching your location...</Text>
                </View>
            )}

            {/* Custom Floating Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Search size={20} color="#666" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by city (e.g. Arizona, London)..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        placeholderTextColor="#999"
                        returnKeyType="search"
                    />
                    {loading && <Text style={{ fontSize: 10 }}>...</Text>}
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('Recommendations')}
                >
                    <NavIcon size={24} color="#fff" />
                    <Text style={styles.actionText}>Trip Suggestions</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        padding: 10,
    },
    searchBox: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: '#333',
        fontSize: 16,
        height: 40,
    },
    actionButtons: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
    },
    actionButton: {
        flexDirection: 'row',
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    actionText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    }
});
