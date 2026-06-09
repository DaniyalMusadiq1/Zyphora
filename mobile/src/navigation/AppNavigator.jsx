import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

// Auth screens
import AuthWelcomeScreen from '../screens/AuthWelcomeScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

// Main screens
import DashboardScreen from '../screens/DashboardScreen';
import TasksScreen from '../screens/TasksScreen'; // Updated to map to spec
import FriendsScreen from '../screens/FriendsScreen'; // Updated to map to spec
import WalletScreen from '../screens/WalletScreen'; // Updated to map to spec
import KycScreen from '../screens/KycScreen'; // KYC Verification screen

import api from '../redux/api';
import { setProfile } from '../redux/slices/authSlice';
import { Colors } from '../theme/theme';
import SplashScreen from '../screens/Splashscreen';
import OnboardScreen from '../screens/Onboardscreen';

const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const MainStack = createNativeStackNavigator();

function AuthFlow() {
  return (
    <AuthStack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.b0 },
      }}
    >
      <AuthStack.Screen name="Welcome" component={AuthWelcomeScreen} />
      <AuthStack.Screen name="SignIn" component={SignInScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

// Exact vector path definitions corresponding to the modern flat geometric design spec
const TAB_ICONS = {
  Home: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  Task: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  Friends: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  Wallet: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
};

function TabIcon({ name, focused }) {
  const path = TAB_ICONS[name] || '';
  
  // Implements dark sleek styles matching the web design template properties
  const activeStroke = 'rgba(255,255,255,1)';
  const inactiveStroke = 'rgba(255,255,255,0.3)';

  return (
    <View style={[tabStyles.iconWrap, focused && tabStyles.iconWrapActive]}>
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Path
          d={path}
          fill="none"
          stroke={focused ? activeStroke : inactiveStroke}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      {focused && <View style={tabStyles.activeDot} />}
    </View>
  );
}

// Premium glassmorphic bottom bar sits safely above system elements
function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 10);

  return (
    <View style={[tabStyles.bar, { paddingBottom: bottomPad }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? route.name;
        const focused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <View key={route.key} style={tabStyles.tabItem}>
            <View
              style={tabStyles.hitArea}
              onStartShouldSetResponder={() => true}
              onResponderRelease={onPress}
            >
              <TabIcon name={label} focused={focused} />
              <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>
                {label}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="TasksTab"
        component={TasksScreen}
        options={{ tabBarLabel: 'Task' }}
      />
      <Tab.Screen
        name="FriendsTab"
        component={FriendsScreen}
        options={{ tabBarLabel: 'Friends' }}
      />
      <Tab.Screen
        name="WalletTab"
        component={WalletScreen}
        options={{ tabBarLabel: 'Wallet' }}
      />
    </Tab.Navigator>
  );
}

function MainStackNav() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="MainTabs" component={MainTabs} />
      <MainStack.Screen name="Kyc" component={KycScreen} />
    </MainStack.Navigator>
  );
}

function AppContent() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.token);
  const displayName = useSelector((s) => s.auth.displayName);
  const [gate, setGate] = useState({ status: 'idle', needName: false });

  useEffect(() => {
    if (!token) {
      setGate({ status: 'idle', needName: false });
      return;
    }
    let cancelled = false;
    setGate({ status: 'loading', needName: false });
    (async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (cancelled) return;
        dispatch(setProfile(data.user));
        const nm = data.user?.name;
        setGate({ status: 'ready', needName: !nm || !String(nm).trim() });
      } catch {
        if (!cancelled) setGate({ status: 'ready', needName: false });
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    if (token && displayName && String(displayName).trim()) {
      setGate((g) => ({ ...g, needName: false }));
    }
  }, [displayName, token]);

  if (!token) return <AuthFlow />;

  if (gate.status === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.b0 }}>
        <ActivityIndicator size="large" color="rgba(255,255,255,0.3)" />
        <Text style={{ color: 'rgba(255,255,255,0.5)', marginTop: 16, fontSize: 13 }}>
          Loading your profile…
        </Text>
      </View>
    );
  }

  return <MainStackNav />;
}

export default function AppNavigator() {
  const [splashDone, setSplashDone] = useState(false);
  const [onboardDone, setOnboardDone] = useState(false);

  if (!splashDone) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />;
  }
  if (!onboardDone) {
    return <OnboardScreen onFinish={() => setOnboardDone(true)} />;
  }
  return <AppContent />;
}

const tabStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(6,9,18,0.97)', // High fidelity matching background
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)', // Thin geometric borders
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 24,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  hitArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 5,
    minWidth: 64,
    minHeight: 52,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 32,
    borderRadius: 12, // Consistent smooth corner profile layout
    marginBottom: 4,
  },
  iconWrapActive: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  activeDot: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  label: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 0.4,
    textTransform: 'uppercase', // Flat minimalist tracking rules
    color: 'rgba(255,255,255,0.3)',
  },
  labelActive: {
    color: '#FFFFFF', // High contrast active item indicator
    fontWeight: '600',
  },
});