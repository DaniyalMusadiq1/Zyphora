import React, { useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { ZyText } from '../common/ZyText';

const CELL = 48;

/**
 * Single invisible input + six cells — supports paste and quick entry.
 */
export function OtpVisualInput({ value, onChange, length = 6 }) {
  const ref = useRef(null);
  const [focused, setFocused] = useState(false);
  const digits = (value || '').replace(/\D/g, '').slice(0, length);
  const padded = digits.padEnd(length, ' ');

  return (
    <Pressable onPress={() => ref.current?.focus()} className="w-full">
      <View className="flex-row justify-between gap-1.5">
        {Array.from({ length }, (_, i) => (
          <View
            key={String(i)}
            style={{ width: CELL, height: CELL + 8 }}
            className={`items-center justify-center rounded-2xl border-2 bg-[#141428] ${
              focused && i === digits.length ? 'border-zy-purple' : 'border-[#2A2A3F]'
            }`}
          >
            <ZyText variant="h2" className="text-zy-white">
              {padded[i] === ' ' ? '' : padded[i]}
            </ZyText>
          </View>
        ))}
      </View>
      <TextInput
        ref={ref}
        value={digits}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, length))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        maxLength={length}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="absolute h-1 w-1 opacity-0"
        accessibilityLabel="One time code"
      />
    </Pressable>
  );
}
