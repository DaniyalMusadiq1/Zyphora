import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../../theme/theme';

export default function ZyButton({ 
  label, 
  loading, 
  onPress, 
  variant = 'primary', 
  disabled = false, 
  trailingIcon, // Expected format: <Icon name="arrow-forward" size={16} ... />
  style 
}) {
  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.primary : styles.secondary,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={Colors.w || '#FFF'} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {/* Explicitly wrapping the text block guarantees it won't break layout lines */}
          <Text style={[styles.label, isPrimary ? styles.primaryLabel : styles.secondaryLabel]}>
            {label}
          </Text>
          
          {/* Renders the trailing icon safely if provided */}
          {trailingIcon ? trailingIcon : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 54, // slightly taller for a modern, premium feel
    borderRadius: BorderRadius.md || 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.sm || 10,
    width: '100%',
  },
  primary: { 
    backgroundColor: '#6366F1', // Premium Indigo accent color 
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  secondary: { 
    backgroundColor: Colors.w04 || 'rgba(255,255,255,0.04)', 
    borderWidth: 1, 
    borderColor: Colors.line || 'rgba(255,255,255,0.07)' 
  },
  pressed: { 
    opacity: 0.85,
    transform: [{ scale: 0.99 }]
  },
  disabled: { 
    opacity: 0.4,
    shadowOpacity: 0, // removes glowing shadows when button is unclickable
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8, // perfect spacing separation between text and icon
  },
  label: { 
    fontSize: 15, 
    fontWeight: '700', 
    letterSpacing: 0.2 
  },
  primaryLabel: { 
    color: Colors.w || '#FFFFFF' 
  },
  secondaryLabel: { 
    color: Colors.w70 || 'rgba(255,255,255,0.7)' 
  },
});