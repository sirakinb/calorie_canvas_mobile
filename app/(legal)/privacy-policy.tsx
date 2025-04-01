import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '../../components/ThemedText';
import { Stack } from 'expo-router';

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        title: "Privacy Policy",
        headerStyle: {
          backgroundColor: '#000',
        },
        headerTintColor: '#fff',
      }} />
      
      <ScrollView style={styles.content}>
        <ThemedText style={styles.title}>Privacy Policy</ThemedText>
        <ThemedText style={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString()}</ThemedText>

        <Section title="1. Information We Collect">
          <Bullet text="Photos you take or upload of your meals" />
          <Bullet text="Your nutrition and fitness goals" />
          <Bullet text="Your meal logging data" />
          <Bullet text="Device information for app functionality" />
        </Section>

        <Section title="2. How We Use Your Information">
          <Bullet text="To provide meal logging and nutrition tracking features" />
          <Bullet text="To analyze your meals and provide nutritional information" />
          <Bullet text="To track your progress towards your goals" />
          <Bullet text="To improve our app's functionality" />
        </Section>

        <Section title="3. Data Storage">
          <Bullet text="We use Supabase to securely store your data" />
          <Bullet text="Your data is encrypted in transit and at rest" />
          <Bullet text="You can request deletion of your data at any time" />
        </Section>

        <Section title="4. Camera and Photo Access">
          <Bullet text="We request camera access to take photos of meals" />
          <Bullet text="Photos are stored securely and used only for meal logging" />
          <Bullet text="You can revoke camera access in device settings" />
        </Section>

        <Section title="5. Your Rights">
          <Bullet text="Access your personal data" />
          <Bullet text="Correct inaccurate data" />
          <Bullet text="Delete your account and data" />
          <Bullet text="Export your data" />
        </Section>

        <Section title="6. Contact Us">
          <ThemedText style={styles.paragraph}>
            If you have any questions about this Privacy Policy, please contact us at:
          </ThemedText>
          <ThemedText style={styles.contact}>support@caloriecanvas.com</ThemedText>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      {children}
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bulletPoint}>
      <ThemedText style={styles.bullet}>•</ThemedText>
      <ThemedText style={styles.bulletText}>{text}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#4ADE80',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  bullet: {
    marginRight: 8,
    color: '#666',
  },
  bulletText: {
    flex: 1,
    color: '#fff',
  },
  paragraph: {
    marginBottom: 8,
    lineHeight: 20,
  },
  contact: {
    color: '#4ADE80',
    marginTop: 8,
  },
}); 