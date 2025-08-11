import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#111827' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="lobby" />
        <Stack.Screen name="videochat" />
      </Stack>
    </SafeAreaProvider>
  );
}