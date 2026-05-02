import 'react-native-reanimated';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FlowProvider } from './src/context/FlowContext';
import { FlowNavigator } from './src/navigation/FlowNavigator';
import { theme } from './src/constants/theme';
import { View, ActivityIndicator } from 'react-native';

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <FlowProvider>
        <StatusBar style="dark" backgroundColor={theme.colors.background} />
        <FlowNavigator />
      </FlowProvider>
    </SafeAreaProvider>
  );
}
