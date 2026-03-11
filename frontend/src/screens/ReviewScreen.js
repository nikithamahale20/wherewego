import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Star } from 'lucide-react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.10.0.152:5001/api';
const TAGS = ['cousins', 'friends', 'family', 'couple', 'others'];

export default function ReviewScreen({ route, navigation }) {
    const { placeId, name, address, coordinates } = route.params || {};
    const [rating, setRating] = useState(0);
    const [selectedTag, setSelectedTag] = useState('');
    const [review, setReview] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!rating || !selectedTag) {
            Alert.alert("Missing Fields", "Please select a rating and a travel group.");
            return;
        }

        setLoading(true);
        try {
            const userId = await AsyncStorage.getItem('userId');

            await axios.post(`${API_URL}/locations/review`, {
                placeId,
                name: name || "Unknown Place",
                address: address || "Unknown Address",
                coordinates: coordinates || { lat: 0, lng: 0 },
                rating,
                review,
                groupType: selectedTag.charAt(0).toUpperCase() + selectedTag.slice(1),
                userId
            });

            Alert.alert('Visit Logged!', 'Your review was submitted and this place has been added to your Visited profile.');
            navigation.goBack();
        } catch (error) {
            console.error("Submission error", error);
            Alert.alert("Error", "Could not submit review.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>You visited {name || 'this location'}!</Text>
            <Text style={styles.subtitleText}>How was your visit?</Text>

            {/* Star Rating */}
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setRating(star)}>
                        <Star
                            size={40}
                            color={star <= rating ? "#FFD700" : "#ccc"}
                            fill={star <= rating ? "#FFD700" : "transparent"}
                        />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Group Tagging */}
            <Text style={styles.subtitle}>Who were you with?</Text>
            <View style={styles.tagsContainer}>
                {TAGS.map((tag) => (
                    <TouchableOpacity
                        key={tag}
                        style={[styles.tag, selectedTag === tag && styles.tagSelected]}
                        onPress={() => setSelectedTag(tag)}
                    >
                        <Text style={[styles.tagText, selectedTag === tag && styles.tagTextSelected]}>
                            {tag.charAt(0).toUpperCase() + tag.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Review text */}
            <TextInput
                style={styles.input}
                placeholder="Share your experience..."
                multiline
                numberOfLines={4}
                value={review}
                onChangeText={setReview}
            />

            <TouchableOpacity
                style={[styles.submitButton, loading && { opacity: 0.7 }]}
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Post Review & Add to Profile</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    subtitleText: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 25,
    },
    tag: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#007AFF',
        marginRight: 10,
        marginBottom: 10,
    },
    tagSelected: {
        backgroundColor: '#007AFF',
    },
    tagText: {
        color: '#007AFF',
        fontWeight: '500',
    },
    tagTextSelected: {
        color: '#fff',
    },
    input: {
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        height: 120,
        textAlignVertical: 'top',
        marginBottom: 30,
    },
    submitButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 50,
    },
    submitText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    }
});
