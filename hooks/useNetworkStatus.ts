import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);
      
      // Log network changes in development
      if (__DEV__) {
        console.log('Network state changed:', {
          type: state.type,
          isConnected: state.isConnected,
          isInternetReachable: state.isInternetReachable,
          details: Platform.select({
            ios: state.details,
            android: {
              strength: state.details?.strength,
              isConnectionExpensive: state.details?.isConnectionExpensive,
            },
          }),
        });
      }
    });

    // Initial check
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    isConnected,
    isInternetReachable,
    isOffline: !isConnected || !isInternetReachable,
  };
} 