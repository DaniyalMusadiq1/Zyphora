import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../../theme/theme';

export default function ZyInput({ label, error, secureTextEntry, containerStyle, ...props }) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isSecure = secureTextEntry && !isPasswordVisible;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholderTextColor={Colors.w30}
          secureTextEntry={isSecure}
          {...props}
        />
        {secureTextEntry && (
          <Pressable
            style={styles.eyeIcon}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Text style={styles.eyeText}>{isPasswordVisible ? '👁️' : '👁️‍🗨️'}</Text>
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: Spacing.md },
  label: { fontSize: 12, fontWeight: '500', color: Colors.w70, marginBottom: 6 },
  inputContainer: { position: 'relative' },
  input: {
    height: 50,
    backgroundColor: Colors.b2,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: 14,
    color: Colors.w,
    paddingRight: Spacing.xl,
  },
  inputError: { borderColor: Colors.error, borderWidth: 1.5 },
  eyeIcon: { position: 'absolute', right: 12, top: 13 },
  eyeText: { fontSize: 18, color: Colors.w70 },
  errorText: { fontSize: 11, color: Colors.error, marginTop: 4, marginLeft: 4 },
});