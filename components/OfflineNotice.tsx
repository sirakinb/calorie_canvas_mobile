import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export function OfflineNotice() {
  const { isOffline } = useNetworkStatus();
  const [slideAnim] = React.useState(new Animated.Value(-100));

  React.useEffect(() => {
    if (isOffline) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: -100,
        useNativeDriver: true,
      }).start();
    }
  }, [isOffline]);

  if (!isOffline) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}>
      <View style={styles.content}>
        <Ionicons name="cloud-offline-outline" size={24} color="white" />
        <ThemedText style={styles.text}>No Internet Connection</ThemedText>
      </View>
      <ThemedText style={styles.subText}>
        Some features may be unavailable
      </ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FF4444',
    padding: 10,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  subText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
}); 