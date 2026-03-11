import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Using actual backend IP logic mapping
const API_URL = 'http://10.10.0.152:5001/api/auth';

const INTERESTS = [
    'Nature',
    'Food',
    'Adventure',
    'Historical places',
    'Religious places'
];

export default function OnboardingInterestsScreen({ onComplete }) {
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [loading, setLoading] = useState(false);

    const toggleInterest = (interest) => {
        if (selectedInterests.includes(interest)) {
            setSelectedInterests(selectedInterests.filter(i => i !== interest));
        } else {
            setSelectedInterests([...selectedInterests, interest]);
        }
    };

    const saveProfile = async () => {
        if (selectedInterests.length === 0) {
            Alert.alert('Hold on!', 'Please select at least one interest to personalize your recommendations.');
            return;
        }

        setLoading(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                Alert.alert('Session Error', 'User session missing.');
                return;
            }

            await axios.put(`${API_URL}/onboarding`, {
                userId,
                interests: selectedInterests
            });

            // Notify App.js to jump into Main map
            if (onComplete) onComplete();

        } catch (error) {
            Alert.alert('Save Failed', 'Could not save your preferences. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>What do you love?</Text>
            <Text style={styles.subtitle}>Select your travel interests to get personalized recommendations.</Text>

            <ScrollView contentContainerStyle={styles.list}>
                {INTERESTS.map(interest => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                        <TouchableOpacity
                            key={interest}
                            style={[styles.interestButton, isSelected && styles.interestButtonSelected]}
                            onPress={() => toggleInterest(interest)}
                        >
                            <Text style={[styles.interestText, isSelected && styles.interestTextSelected]}>
                                {interest}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <TouchableOpacity
                style={styles.saveButton}
                onPress={saveProfile}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Profile & Continue</Text>}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#fff'
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333'
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30
    },
    list: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start'
    },
    interestButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 24,
        marginRight: 10,
        marginBottom: 15,
        backgroundColor: '#fff'
    },
    interestButtonSelected: {
        borderColor: '#007AFF',
        backgroundColor: '#007AFF'
    },
    interestText: {
        fontSize: 16,
        color: '#333'
    },
    interestTextSelected: {
        color: '#fff',
        fontWeight: 'bold'
    },
    saveButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 30
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18
    }
});
