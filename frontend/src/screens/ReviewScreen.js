import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Star, Camera } from 'lucide-react-native';

const TAGS = ['cousins', 'friends', 'family', 'couple', 'others'];

export default function ReviewScreen({ route, navigation }) {
    const [rating, setRating] = useState(0);
    const [selectedTag, setSelectedTag] = useState('');
    const [review, setReview] = useState('');

    const handleSubmit = () => {
        // API call to backend/api/locations/review
        alert('Review Submitted! Thanks for helping others.');
        navigation.goBack();
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>How was your visit?</Text>

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

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitText}>Post Review</Text>
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
        marginTop: 40,
        marginBottom: 20,
        textAlign: 'center',
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
