import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/theme';

export default function SplashScreen({ onFinish }) {
  const ring1Scale = useRef(new Animated.Value(1)).current;
  const ring1Opacity = useRef(new Animated.Value(0.6)).current;
  const tagFade = useRef(new Animated.Value(0)).current;
  const logoFade = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(logoFade, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ring1Scale, { toValue: 1.06, duration: 1500, useNativeDriver: true }),
          Animated.timing(ring1Opacity, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(ring1Scale, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(ring1Opacity, { toValue: 0.6, duration: 1500, useNativeDriver: true }),
        ]),
      ])
    ).start();

    setTimeout(() => {
      Animated.timing(tagFade, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    }, 500);

    Animated.timing(progressWidth, { toValue: 1, duration: 2000, useNativeDriver: false }).start();

    const timer = setTimeout(() => onFinish?.(), 2600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.ringOuter, { transform: [{ scale: ring1Scale }], opacity: ring1Opacity }]}
      />
      <View style={styles.ringInner} />

      <Animated.View style={[styles.center, { opacity: logoFade }]}>
        <View style={styles.logoBox}>
          <Text style={styles.logoLetter}>Z</Text>
        </View>
        <Text style={styles.wordmark}>ZYPHORA</Text>
        <Animated.Text style={[styles.tagline, { opacity: tagFade }]}>
          Participation Network
        </Animated.Text>
      </Animated.View>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.loadingText}>LOADING</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.b0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOuter: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  ringInner: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: Colors.w08,
  },
  center: {
    alignItems: 'center',
    gap: 18,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.w15,
    backgroundColor: Colors.w04,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    fontSize: 34,
    fontWeight: '300',
    color: Colors.w,
    letterSpacing: -0.5,
  },
  wordmark: {
    fontSize: 24,
    fontWeight: '300',
    color: Colors.w,
    letterSpacing: 10,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  tagline: {
    fontSize: 10,
    fontWeight: '400',
    color: Colors.textDim,
    letterSpacing: 6,
    textTransform: 'uppercase',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 70,
    alignItems: 'center',
    gap: 8,
    width: 140,
  },
  progressTrack: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.line2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 1,
    backgroundColor: Colors.w50,
  },
  loadingText: {
    fontSize: 9,
    color: Colors.textDim,
    letterSpacing: 5,
    textTransform: 'uppercase',
  },
});