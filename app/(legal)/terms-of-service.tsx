import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '../../components/ThemedText';
import { Stack } from 'expo-router';

export default function TermsOfServiceScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        title: "Terms of Service",
        headerStyle: {
          backgroundColor: '#000',
        },
        headerTintColor: '#fff',
      }} />
      
      <ScrollView style={styles.content}>
        <ThemedText style={styles.title}>Terms of Service</ThemedText>
        <ThemedText style={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString()}</ThemedText>

        <Section title="1. Acceptance of Terms">
          <ThemedText style={styles.paragraph}>
            By accessing or using CalorieCanvas, you agree to be bound by these Terms of Service and all applicable laws and regulations.
          </ThemedText>
        </Section>

        <Section title="2. Use of Service">
          <Bullet text="You must provide accurate information when creating an account" />
          <Bullet text="You are responsible for maintaining the security of your account" />
          <Bullet text="You agree not to misuse or abuse the service" />
          <Bullet text="You must be at least 13 years old to use this service" />
        </Section>

        <Section title="3. User Content">
          <Bullet text="You retain rights to the photos you upload" />
          <Bullet text="You grant us license to use your content to provide the service" />
          <Bullet text="You must not upload content that violates any laws" />
          <Bullet text="We may remove content that violates these terms" />
        </Section>

        <Section title="4. Subscription and Payments">
          <Bullet text="Some features may require a paid subscription" />
          <Bullet text="Subscriptions automatically renew unless cancelled" />
          <Bullet text="Refunds are handled according to App Store policies" />
          <Bullet text="Prices may change with notice" />
        </Section>

        <Section title="5. Disclaimer">
          <ThemedText style={styles.paragraph}>
            The app provides general nutrition information and is not a substitute for professional medical advice. Consult healthcare professionals for medical advice.
          </ThemedText>
        </Section>

        <Section title="6. Limitation of Liability">
          <ThemedText style={styles.paragraph}>
            To the maximum extent permitted by law, CalorieCanvas shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
          </ThemedText>
        </Section>

        <Section title="7. Changes to Terms">
          <ThemedText style={styles.paragraph}>
            We may modify these terms at any time. Continued use of the service after changes constitutes acceptance of new terms.
          </ThemedText>
        </Section>

        <Section title="8. Contact">
          <ThemedText style={styles.paragraph}>
            For questions about these Terms, please contact:
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