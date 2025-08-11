import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { io, Socket } from 'socket.io-client';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Message {
  text: string;
  sender: 'You' | 'Stranger';
}

export default function VideoChat() {
  const params = useLocalSearchParams();
  const serverUrl = (params.serverUrl as string) || 'http://192.168.0.194:8000'; // Update with your server IP
  
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [spinnerVisible, setSpinnerVisible] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const typeRef = useRef<string>('');
  const remoteSocketRef = useRef<string>('');
  const messagesEndRef = useRef<ScrollView>(null);

  useEffect(() => {
    initializeConnection();

    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave');
      socketRef.current.disconnect();
    }
    setMessages([]);
  };

  const initializeConnection = () => {
    console.log('Connecting to:', serverUrl);
    
    socketRef.current = io(serverUrl, {
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      
      socketRef.current?.emit('start', (person: string) => {
        typeRef.current = person;
        console.log('Type:', person);
      });
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
      setSpinnerVisible(false);
      Alert.alert(
        'Connection Error', 
        'Unable to connect to server. Make sure the server is running and the URL is correct.',
        [{ text: 'OK', onPress: () => router.replace('/lobby') }]
      );
    });

    socketRef.current.on('remote-socket', (id: string) => {
      console.log('Connected to stranger:', id);
      remoteSocketRef.current = id;
      setSpinnerVisible(false);
      
      // Show a message that stranger connected
      setMessages([{ text: 'Stranger connected!', sender: 'You' }]);
    });

    socketRef.current.on('disconnected', () => {
      Alert.alert('Disconnected', 'The other user has left the chat', [
        { text: 'OK', onPress: () => router.replace('/lobby') }
      ]);
    });

    socketRef.current.on('chat:receive', ({ message }: { message: string }) => {
      setMessages(prev => [...prev, { text: message, sender: 'Stranger' }]);
    });

    socketRef.current.on('skipped', () => {
      cleanup();
      setSpinnerVisible(true);
      initializeConnection();
    });
  };

  const toggleAudio = () => {
    setIsAudioMuted(!isAudioMuted);
    Alert.alert('Info', 'Audio toggle requires WebRTC. Create a development build to enable video/audio features.');
  };

  const toggleVideo = () => {
    setIsVideoMuted(!isVideoMuted);
    Alert.alert('Info', 'Video toggle requires WebRTC. Create a development build to enable video/audio features.');
  };

  const skipRoom = () => {
    socketRef.current?.emit('skip');
    cleanup();
    setSpinnerVisible(true);
    initializeConnection();
  };

  const leaveRoom = () => {
    cleanup();
    router.replace('/lobby');
  };

  const sendMessage = () => {
    if (newMessage.trim() && socketRef.current && remoteSocketRef.current) {
      socketRef.current.emit('chat:send', { message: newMessage });
      setMessages(prev => [...prev, { text: newMessage, sender: 'You' }]);
      setNewMessage('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {spinnerVisible && (
        <View style={styles.spinner}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.spinnerText}>Finding someone...</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>SoulMegle</Text>
        <View style={styles.controls}>
          <Pressable
            style={[styles.controlButton, isVideoMuted && styles.controlButtonMuted]}
            onPress={toggleVideo}
          >
            <Text style={styles.controlIcon}>📹</Text>
          </Pressable>
          <Pressable
            style={[styles.controlButton, isAudioMuted && styles.controlButtonMuted]}
            onPress={toggleAudio}
          >
            <Text style={styles.controlIcon}>🎤</Text>
          </Pressable>
          <Pressable style={[styles.controlButton, styles.skipButton]} onPress={skipRoom}>
            <Text style={styles.controlIcon}>⏭️</Text>
          </Pressable>
          <Pressable style={[styles.controlButton, styles.endButton]} onPress={leaveRoom}>
            <Text style={styles.controlIcon}>📞</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        {/* Video placeholder area */}
        <View style={styles.videosContainer}>
          <View style={styles.videoPlaceholder}>
            <Text style={styles.placeholderText}>Stranger's Video</Text>
            <Text style={styles.placeholderSubtext}>Video requires development build</Text>
          </View>
          
          <View style={styles.localVideoPlaceholder}>
            <Text style={styles.placeholderText}>Your Video</Text>
          </View>
        </View>

        {/* Chat Interface */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.chatContainer}
        >
          <ScrollView
            ref={messagesEndRef}
            style={styles.messagesContainer}
            onContentSizeChange={() => messagesEndRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((msg, index) => (
              <View
                key={index}
                style={[
                  styles.messageWrapper,
                  msg.sender === 'You' ? styles.messageWrapperSelf : styles.messageWrapperOther,
                ]}
              >
                <Text style={styles.messageText}>{msg.text}</Text>
              </View>
            ))}
          </ScrollView>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#6B7280"
              value={newMessage}
              onChangeText={setNewMessage}
              onSubmitEditing={sendMessage}
            />
            <Pressable style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendButtonText}>Send</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* Connection status */}
      {!isConnected && !spinnerVisible && (
        <View style={styles.connectionStatus}>
          <Text style={styles.connectionText}>Not connected to server</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  spinner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    zIndex: 100,
  },
  spinnerText: {
    color: '#FFFFFF',
    marginTop: 20,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#1F2937',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  controls: {
    flexDirection: 'row',
    gap: 10,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonMuted: {
    backgroundColor: '#4B5563',
  },
  skipButton: {
    backgroundColor: '#3B82F6',
  },
  endButton: {
    backgroundColor: '#EF4444',
  },
  controlIcon: {
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  videosContainer: {
    flex: 1,
    position: 'relative',
    padding: 10,
  },
  videoPlaceholder: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  localVideoPlaceholder: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 10,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  placeholderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  placeholderSubtext: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 5,
  },
  chatContainer: {
    height: screenHeight * 0.3,
    backgroundColor: '#1F2937',
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messageWrapper: {
    marginVertical: 2,
    maxWidth: '70%',
    padding: 10,
    borderRadius: 10,
  },
  messageWrapperSelf: {
    alignSelf: 'flex-end',
    backgroundColor: '#7C3AED',
  },
  messageWrapperOther: {
    alignSelf: 'flex-start',
    backgroundColor: '#374151',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  input: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    color: '#FFFFFF',
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  connectionStatus: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  connectionText: {
    color: '#EF4444',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
});