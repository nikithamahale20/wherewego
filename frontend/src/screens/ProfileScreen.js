import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LogOut, CheckCircle, Save } from 'lucide-react-native';
import axios from 'axios';

const API_URL = 'http://10.10.0.152:5001/api';

const ALL_INTERESTS = [
    'Nature',
    'Food',
    'Adventure',
    'Historical places',
    'Religious places',
    'Nightlife',
    'Shopping',
    'Relaxation'
];

export default function ProfileScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                if (!userId) return;

                const response = await axios.get(`${API_URL}/auth/profile/${userId}`);
                setName(response.data.name);
                setEmail(response.data.email);
                if (response.data.interests) {
                    setSelectedInterests(response.data.interests);
                }
            } catch (error) {
                console.error("Failed to load profile", error);
                Alert.alert("Error", "Could not load user profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const toggleInterest = (interest) => {
        if (selectedInterests.includes(interest)) {
            setSelectedInterests(selectedInterests.filter(i => i !== interest));
        } else {
            setSelectedInterests([...selectedInterests, interest]);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            await axios.put(`${API_URL}/auth/onboarding`, {
                userId,
                interests: selectedInterests
            });
            Alert.alert("Success", "Interests updated successfully");
            navigation.goBack();
        } catch (error) {
            console.error("Save error", error);
            Alert.alert("Error", "Could not save your preferences");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert("Log Out", "Are you sure you want to log out?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Log Out",
                style: "destructive",
                onPress: async () => {
                    await AsyncStorage.removeItem('userId');
                    await AsyncStorage.removeItem('userToken');
                    await AsyncStorage.removeItem('onboardingCompleted');
                    // App.js handles the navigation switch based on token
                    // But to force a quick unmount we could reload or wait for App state trickling down
                    // Since we removed token, Native Stack might need a manual reset if we don't have context.
                    // Instead, many use RN Restart or just let the context update. 
                    // Let's do a quick naive navigation hack or assume App.js state checks interval.
                    alert("Logged out. Please restart the app.");
                }
            }
        ]);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.headerRow}>
                <View style={styles.avatar}>
                    <User size={40} color="#007AFF" />
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.email}>{email}</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>What's your current vibe?</Text>
            <Text style={styles.sectionSubtitle}>Change these anytime to update your map recommendations.</Text>

            <View style={styles.interestsContainer}>
                {ALL_INTERESTS.map(interest => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                        <TouchableOpacity
                            key={interest}
                            style={[styles.interestPill, isSelected && styles.interestPillActive]}
                            onPress={() => toggleInterest(interest)}
                        >
                            {isSelected && <CheckCircle size={16} color="#fff" style={{ marginRight: 6 }} />}
                            <Text style={[styles.interestText, isSelected && styles.interestTextActive]}>
                                {interest}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={saving}
            >
                {saving ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        <Save size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.saveButtonText}>Save Map Preferences</Text>
                    </>
                )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <LogOut size={20} color="#FF3B30" style={{ marginRight: 8 }} />
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
        flexGrow: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 20
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E1EFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20
    },
    userInfo: {
        flex: 1,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#222',
    },
    email: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    interestsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 40,
    },
    interestPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#f1f1f1',
        borderRadius: 20,
        marginRight: 10,
        marginBottom: 10,
    },
    interestPillActive: {
        backgroundColor: '#007AFF',
    },
    interestText: {
        fontSize: 15,
        color: '#555',
        fontWeight: '500',
    },
    interestTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    saveButton: {
        flexDirection: 'row',
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logoutButton: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF0F0',
    },
    logoutText: {
        color: '#FF3B30',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
