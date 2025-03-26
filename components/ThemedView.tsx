import { View, ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView(props: ViewProps) {
  return <View {...props} style={[{ backgroundColor: '#000' }, props.style]} />;
}
