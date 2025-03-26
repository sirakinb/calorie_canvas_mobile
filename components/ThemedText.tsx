import { Text, TextProps, StyleSheet } from 'react-native';
import { useMemo } from 'react';

interface ThemedTextProps extends TextProps {
  type?: 'default' | 'title' | 'defaultSemiBold';
}

export function ThemedText({ style, type = 'default', ...props }: ThemedTextProps) {
  const textStyle = useMemo(() => {
    switch (type) {
      case 'title':
        return styles.title;
      case 'defaultSemiBold':
        return styles.defaultSemiBold;
      default:
        return styles.default;
    }
  }, [type]);

  return <Text style={[textStyle, style]} {...props} />;
}

const styles = StyleSheet.create({
  default: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  defaultSemiBold: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
