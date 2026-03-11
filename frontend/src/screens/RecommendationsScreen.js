import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { MapPin, Users, Star } from 'lucide-react-native';

export default function RecommendationsScreen() {
    const [recommendations, setRecommendations] = useState([
        {
            id: '1',
            name: 'Central Park',
            city: 'New York',
            rating: 4.8,
            tags: ['family', 'friends'],
            imageUrl: 'https://images.unsplash.com/photo-1533604133517-bb092f5f12cd?auto=format&fit=crop&w=800&q=80',
        },
        {
            id: '2',
            name: 'Sky Garden',
            city: 'London',
            rating: 4.6,
            tags: ['couple', 'cousins'],
            imageUrl: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=800&q=80',
            isSponsored: true,
        }
    ]);

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            {item.isSponsored && (
                <View style={styles.sponsoredBadge}>
                    <Text style={styles.sponsoredText}>Sponsored</Text>
                </View>
            )}
            <View style={styles.cardContent}>
                <Text style={styles.placeName}>{item.name}</Text>
                <View style={styles.row}>
                    <MapPin size={14} color="#666" />
                    <Text style={styles.cityText}>{item.city}</Text>
                </View>
                <View style={styles.tagRow}>
                    {item.tags.map(tag => (
                        <View key={tag} style={styles.tagBadge}>
                            <Users size={12} color="#007AFF" style={{ marginRight: 4 }} />
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
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
            <Text style={styles.header}>Trips for your Group</Text>
            <FlatList
                data={recommendations}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        padding: 20,
        backgroundColor: '#fff',
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
    sponsoredBadge: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: 'rgba(0,0,0,0.6)',
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
