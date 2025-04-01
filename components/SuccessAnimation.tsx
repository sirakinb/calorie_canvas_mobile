import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  message?: string;
  onComplete?: () => void;
  duration?: number;
}

export function SuccessAnimation({ 
  message = 'Success!', 
  onComplete,
  duration = 2000 
}: Props) {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animations = [
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 15,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      })
    ];

    // Start animations
    Animated.parallel(animations).start();

    // Hide after duration
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.back(2),
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start(() => {
        onComplete?.();
      });
    }, duration);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={48} color="#4ADE80" />
        </View>
        <ThemedText style={styles.message}>{message}</ThemedText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  content: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 16,
    minWidth: 200,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 