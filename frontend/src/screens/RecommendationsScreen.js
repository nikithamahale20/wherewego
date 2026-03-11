import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { MapPin, Users, Star, Compass, Navigation } from 'lucide-react-native';
import axios from 'axios';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.10.0.152:5001/api';
const GROUPS = ['Family', 'Friends', 'Couple', 'Cousins'];

export default function RecommendationsScreen() {
    const [recommendations, setRecommendations] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('Family');
    const [loading, setLoading] = useState(false);
    const [userLoc, setUserLoc] = useState(null);

    // Fetch user location on mount
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            let loc = await Location.getCurrentPositionAsync({});
            setUserLoc(loc.coords);
        })();
    }, []);

    // Whenever location or group changes, fetch new recommendations!
    useEffect(() => {
        if (userLoc) {
            fetchRecommendations();
        }
    }, [userLoc, selectedGroup]);

    const fetchRecommendations = async () => {
        setLoading(true);
        try {
            const userId = await AsyncStorage.getItem('userId');

            const response = await axios.get(`${API_URL}/locations/recommendations`, {
                params: {
                    lat: userLoc.latitude,
                    lng: userLoc.longitude,
                    groupType: selectedGroup,
                    userId: userId
                }
            });
            setRecommendations(response.data);
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            {item.isSponsored && (
                <View style={styles.sponsoredBadge}>
                    <Text style={styles.sponsoredText}>Sponsored</Text>
                </View>
            )}

            <View style={styles.distanceBadge}>
                <Navigation size={12} color="#fff" style={{ marginRight: 4 }} />
                <Text style={styles.distanceText}>{item.distance} km</Text>
            </View>

            <View style={styles.cardContent}>
                <Text style={styles.placeName}>{item.name}</Text>
                <View style={styles.row}>
                    <MapPin size={14} color="#666" />
                    <Text style={styles.cityText} numberOfLines={1}>{item.address}</Text>
                </View>

                {item.description && (
                    <Text style={styles.descriptionText} numberOfLines={2}>
                        {item.description}
                    </Text>
                )}

                <View style={styles.tagRow}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                        {(item.categories || item.tags).map(tag => (
                            <View key={tag} style={styles.tagBadge}>
                                <Compass size={12} color="#007AFF" style={{ marginRight: 4 }} />
                                <Text style={styles.tagText}>{tag}</Text>
                            </View>
                        ))}
                    </ScrollView>
                    <View style={styles.ratingBadge}>
                        <Star size={12} color="#FFD700" fill="#FFD700" style={{ marginRight: 4 }} />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Who are you traveling with?</Text>

            {/* Filter Tabs */}
            <View style={{ height: 60 }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterContainer}
                >
                    {GROUPS.map(group => (
                        <TouchableOpacity
                            key={group}
                            style={[styles.filterBubble, selectedGroup === group && styles.filterBubbleActive]}
                            onPress={() => setSelectedGroup(group)}
                        >
                            <Text style={[styles.filterText, selectedGroup === group && styles.filterTextActive]}>
                                {group}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={{ marginTop: 10, color: '#666' }}>Finding ideal spots for {selectedGroup}...</Text>
                </View>
            ) : (
                <FlatList
                    data={recommendations}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        backgroundColor: '#fff',
        color: '#333'
    },
    filterContainer: {
        paddingHorizontal: 15,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f1f1'
    },
    filterBubble: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#f1f1f1',
        borderRadius: 20,
        marginHorizontal: 5,
    },
    filterBubbleActive: {
        backgroundColor: '#007AFF',
    },
    filterText: {
        color: '#666',
        fontWeight: '600'
    },
    filterTextActive: {
        color: '#fff'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 15,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        marginBottom: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    image: {
        width: '100%',
        height: 180,
    },
    cardContent: {
        padding: 15,
    },
    placeName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#222'
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    cityText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 5,
        flex: 1
    },
    descriptionText: {
        fontSize: 13,
        color: '#555',
        marginBottom: 12,
        lineHeight: 18,
    },
    tagRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tagBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E1EFFF',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 12,
        marginRight: 8,
    },
    tagText: {
        fontSize: 12,
        color: '#007AFF',
        fontWeight: '600',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF9E1',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 12,
        marginLeft: 'auto',
    },
    ratingText: {
        fontSize: 12,
        color: '#B8860B',
        fontWeight: '700',
    },
    distanceBadge: {
        position: 'absolute',
        top: 15,
        left: 15,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center'
    },
    distanceText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
    },
    sponsoredBadge: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: 'rgba(0,122,255,0.9)',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    sponsoredText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    }
});
