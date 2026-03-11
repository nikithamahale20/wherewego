import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, TextInput, FlatList, Platform, Linking, Image, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { MapPin, Search, Navigation as NavIcon, Star, User } from 'lucide-react-native';
import axios from 'axios';

// Helper function to calculate distance using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance; // Returns distance in KM
}

// Use your machine's local IP address so the simulator/device can find the server
const API_URL = 'http://10.10.0.152:5001/api';

export default function MapScreen({ navigation }) {
    const [location, setLocation] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [promptedPlaces, setPromptedPlaces] = useState(new Set());
    const mapRef = useRef(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc.coords);

            // Automatically find nearby attractions once we have the user location
            fetchNearbyPlaces(loc.coords.latitude, loc.coords.longitude);

            // Watch position for continuous updates!
            Location.watchPositionAsync(
                { accuracy: Location.Accuracy.High, distanceInterval: 10 },
                (newLoc) => {
                    setLocation(newLoc.coords);
                }
            );
        })();
    }, []);

    // Check distance whenever location updates
    useEffect(() => {
        if (!location || places.length === 0) return;

        places.forEach(place => {
            if (!place.coordinates || promptedPlaces.has(place.placeId)) return;

            const dist = calculateDistance(
                location.latitude,
                location.longitude,
                place.coordinates.lat,
                place.coordinates.lng
            );

            // If within 50 meters (0.05 km), prompt for review!
            if (dist < 0.05) {
                // Mark as prompted first so we don't get trapped in an infinite loop
                setPromptedPlaces(prev => new Set(prev).add(place.placeId));

                Alert.alert(
                    "You've Arrived!",
                    `Looks like you are at ${place.name}! Would you like to rate this location and add it to your travel history?`,
                    [
                        { text: "Not Now", style: "cancel" },
                        {
                            text: "Leave Review",
                            onPress: () => navigation.navigate('Review', {
                                placeId: place.placeId,
                                name: place.name,
                                address: place.address,
                                coordinates: place.coordinates
                            })
                        }
                    ]
                );
            }
        });
    }, [location, places]);

    const fetchNearbyPlaces = async (lat, lng) => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/locations/google-search`, {
                params: { lat, lng }
            });
            setPlaces(response.data);
        } catch (error) {
            console.error('Failed to fetch nearby places:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            // Search using our new backend Google Places endpoint
            const response = await axios.get(`${API_URL}/locations/google-search`, {
                params: { query: searchQuery }
            });
            setPlaces(response.data);

            // If we found places, move map to first one
            if (response.data.length > 0) {
                const first = response.data[0];
                if (mapRef.current) {
                    mapRef.current.animateToRegion({
                        latitude: first.coordinates.lat,
                        longitude: first.coordinates.lng,
                        latitudeDelta: 0.1,
                        longitudeDelta: 0.1,
                    }, 1000);
                }
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
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={{
                        latitude: location.latitude,
                        longitude: location.longitude,
                        latitudeDelta: 0.1,
                        longitudeDelta: 0.1,
                    }}
                    showsUserLocation={true}
                    onPress={() => setSelectedPlace(null)}
                >
                    {places.map((place) => (
                        <Marker
                            key={place.placeId}
                            coordinate={{
                                latitude: place.coordinates?.lat || location.latitude,
                                longitude: place.coordinates?.lng || location.longitude
                            }}
                            onPress={(e) => {
                                e.stopPropagation();
                                setSelectedPlace(place);

                                // Smoothly animate camera to center on clicked pin
                                mapRef.current?.animateToRegion({
                                    latitude: place.coordinates?.lat || location.latitude,
                                    longitude: place.coordinates?.lng || location.longitude,
                                    latitudeDelta: 0.05,
                                    longitudeDelta: 0.05,
                                }, 500);
                            }}
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

            {/* Place Details Bottom Sheet Card */}
            {selectedPlace && (
                <View style={styles.bottomCard}>
                    <Text style={styles.cardTitle}>{selectedPlace.name}</Text>
                    <Text style={styles.cardDesc} numberOfLines={2}>
                        {selectedPlace.averageRating ? `${selectedPlace.averageRating}⭐ • ` : ''}
                        {selectedPlace.address}
                    </Text>

                    <View style={styles.cardActions}>
                        <TouchableOpacity
                            style={styles.navBtn}
                            onPress={() => {
                                const lat = selectedPlace.coordinates?.lat;
                                const lng = selectedPlace.coordinates?.lng;
                                const label = encodeURIComponent(selectedPlace.name);
                                const url = Platform.select({
                                    ios: `maps:0,0?q=${label}@${lat},${lng}`,
                                    android: `geo:0,0?q=${lat},${lng}(${label})`
                                });
                                Linking.openURL(url);
                            }}
                        >
                            <NavIcon size={18} color="#fff" />
                            <Text style={styles.navBtnText}>Navigate</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.reviewBtn}
                            onPress={() => navigation.navigate('Review', { placeId: selectedPlace.placeId, name: selectedPlace.name })}
                        >
                            <Star size={18} color="#007AFF" />
                            <Text style={styles.reviewBtnText}>Reviews</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Profile Avatar Button (Top Right) */}
            <TouchableOpacity
                style={styles.profileButton}
                onPress={() => navigation.navigate('Profile')}
            >
                <User size={24} color="#333" />
            </TouchableOpacity>
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
        top: 60,
        left: 20,
        right: 75,
        padding: 0,
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
    },
    bottomCard: {
        position: 'absolute',
        bottom: 110,
        left: 20,
        right: 20,
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 6,
    },
    cardDesc: {
        fontSize: 15,
        color: '#666',
        marginBottom: 20,
        lineHeight: 22,
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    navBtn: {
        flexDirection: 'row',
        backgroundColor: '#007AFF',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 14,
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
        justifyContent: 'center',
    },
    navBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    reviewBtn: {
        flexDirection: 'row',
        backgroundColor: '#F0F8FF',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 14,
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    reviewBtnText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    profileButton: {
        position: 'absolute',
        top: 60,
        right: 20,
        backgroundColor: '#fff',
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    }
});
