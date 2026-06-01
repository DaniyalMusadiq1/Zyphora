import { useState, useEffect } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { BorderRadius, Colors, Spacing,  } from '../theme/theme';

let toastRef = null;
export const showToast = (message, type = 'error') => toastRef?.show(message, type);

export function ToastProvider({ children }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('error');
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    toastRef = { show };
    return () => { toastRef = null; };
  }, []);

  const show = (msg, t = 'error') => {
    setMessage(msg);
    setType(t);
    setVisible(true);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(2500),
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setVisible(false));
  };

  if (!visible) return children;
  return (
    <>
      {children}
      <Animated.View style={[styles.toast, { opacity: fadeAnim }, type === 'error' ? styles.error : styles.success]}>
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  toast: { position: 'absolute', bottom: 40, left: Spacing.md, right: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center' },
  error: { backgroundColor: Colors.down },
  success: { backgroundColor: Colors.up },
  text: { color: '#000', fontWeight: '600', fontSize: 13, textAlign: 'center' },
});