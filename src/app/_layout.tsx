import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { LanguageProvider } from '@/context/language-context';
import { ProductProvider } from '@/context/product-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <LanguageProvider>
    <ProductProvider>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="add" />
        <Stack.Screen name="edit" />
      </Stack>
    </ProductProvider>
    </LanguageProvider>
  );
}