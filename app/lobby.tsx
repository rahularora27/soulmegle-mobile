import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { io, Socket } from 'socket.io-client';
import * as Speech from 'expo-speech';

import Constants from 'expo-constants';

const SERVER_URL = '';

export default function Lobby() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [interests, setInterests] = useState('');
  const [manualInterests, setManualInterests] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(SERVER_URL, {
      transports: ['websocket'],
      reconnection: true,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('online', (count: number) => {
      setOnlineUsers(count);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      Alert.alert('Connection Error', 'Unable to connect to server');
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleConnect = () => {
    if (!socket || !socket.connected) {
      Alert.alert('Error', 'Not connected to server');
      return;
    }

    setIsConnecting(true);
    
    // Store interests in a global way or pass them as params
    router.push({
      pathname: '/videochat',
      params: { 
        interests: interests || manualInterests,
        serverUrl: SERVER_URL 
      }
    });
  };

  const speakWelcome = () => {
    Speech.speak('Welcome to SoulMegle. Talk to strangers and make new connections!', {
      language: 'en',
      pitch: 1,
      rate: 0.9,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../assets/icon.png')} 
                style={styles.logo} 
              />
              <Text style={styles.logoText}>SoulMegle</Text>
            </View>
            <View style={styles.onlineContainer}>
              <View style={styles.onlineIndicator} />
              <Text style={styles.onlineText}>{onlineUsers} online</Text>
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            <Text style={styles.title}>Talk to Strangers</Text>
            <Text style={styles.subtitle}>
              Connect with random people around the world
            </Text>

            {/* Interests Input */}
            <View style={styles.interestsContainer}>
              <Text style={styles.interestsLabel}>Your Interests (Optional)</Text>
              <TextInput
                style={styles.interestsInput}
                placeholder="e.g., music, sports, coding, travel..."
                placeholderTextColor="#6B7280"
                value={manualInterests}
                onChangeText={setManualInterests}
                multiline
                numberOfLines={2}
              />
              <Text style={styles.interestsHint}>
                Add interests to match with like-minded people
              </Text>
            </View>

            {/* Voice Feature Info */}
            <Pressable style={styles.voiceButton} onPress={speakWelcome}>
              <Text style={styles.voiceIcon}>🎤</Text>
              <Text style={styles.voiceText}>Tap to hear welcome message</Text>
            </Pressable>

            {/* Connect Button */}
            <Pressable
              style={[styles.connectButton, isConnecting && styles.connectButtonDisabled]}
              onPress={handleConnect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.connectButtonText}>Connect Now</Text>
              )}
            </Pressable>

            {/* Features */}
            <View style={styles.features}>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>💬</Text>
                <Text style={styles.featureText}>Text Chat</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>📹</Text>
                <Text style={styles.featureText}>Video Call</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>🌍</Text>
                <Text style={styles.featureText}>Global</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  onlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  onlineText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 30,
    textAlign: 'center',
  },
  interestsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  interestsLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  interestsInput: {
    backgroundColor: '#1F2937',
    borderRadius: 10,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  interestsHint: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 5,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 20,
  },
  voiceIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  voiceText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  connectButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginBottom: 40,
    elevation: 5,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  connectButtonDisabled: {
    opacity: 0.7,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  feature: {
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 30,
    marginBottom: 5,
  },
  featureText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
});