import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Animated,
  TextInput,
  ActivityIndicator,
  Dimensions,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';

import api from '../redux/api';
import { setCredentials, setDeviceId, setProfile } from '../redux/slices/authSlice';
import { getDeviceFingerprint } from '../utils/deviceFingerprint';
import { showToast } from '../utils/toast';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const C = {
  b0: '#030712',        
  b1: '#0B0F19',        
  b2: '#111827',        
  w: '#FFFFFF',
  w7: 'rgba(255,255,255,0.7)',
  w5: 'rgba(255,255,255,0.5)',
  w3: 'rgba(255,255,255,0.3)',
  ln: 'rgba(255,255,255,0.06)',
  ln2: 'rgba(255,255,255,0.12)',
  accent: '#6366F1',     
  accentDim: 'rgba(99, 102, 241, 0.15)',
  dn: '#EF4444',
};

/* ─── ZERO-DEPENDENCY VECTOR ICONS (Built using CSS/Style borders) ─── */
const UIBoxIcon = {
  Back: ({ color }) => (
    <View style={{ width: 10, height: 10, borderColor: color, borderLeftWidth: 2, borderBottomWidth: 2, transform: [{ rotate: '45deg' }], marginLeft: 4 }} />
  ),
  User: ({ color }) => (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 18, height: 18 }}>
      <View style={{ width: 7, height: 7, borderRadius: 4, borderWidth: 1.8, borderColor: color, marginBottom: 1 }} />
      <View style={{ width: 13, height: 5, borderTopLeftRadius: 5, borderTopRightRadius: 5, borderWidth: 1.8, borderColor: color, borderBottomWidth: 0 }} />
    </View>
  ),
  Mail: ({ color }) => (
    <View style={{ width: 15, height: 11, borderRadius: 2, borderWidth: 1.8, borderColor: color, justifyContent: 'flex-start', alignItems: 'center', overflow: 'hidden' }}>
      <View style={{ width: 10, height: 10, borderWidth: 1.5, borderColor: color, transform: [{ rotate: '45deg' }], marginTop: -6 }} />
    </View>
  ),
  Lock: ({ color }) => (
    <View style={{ alignItems: 'center', width: 14, height: 16, justifyContent: 'flex-end' }}>
      <View style={{ width: 10, height: 9, borderTopLeftRadius: 5, borderTopRightRadius: 5, borderWidth: 1.6, borderColor: color, marginBottom: -2, zIndex: 1 }} />
      <View style={{ width: 14, height: 10, borderRadius: 2.5, borderWidth: 1.8, borderColor: color, backgroundColor: C.b0 }} />
    </View>
  ),
  Shield: ({ color }) => (
    <View style={{ width: 13, height: 15, borderBottomLeftRadius: 6, borderBottomRightRadius: 6, borderTopLeftRadius: 2, borderTopRightRadius: 2, borderWidth: 1.8, borderColor: color }} />
  ),
  Gift: ({ color }) => (
    <View style={{ alignItems: 'center', width: 15, height: 15 }}>
      <View style={{ flexDirection: 'row', gap: 1, marginBottom: 1 }}>
        <View style={{ width: 5, height: 4, borderRadius: 2, borderWidth: 1.5, borderColor: color }} />
        <View style={{ width: 5, height: 4, borderRadius: 2, borderWidth: 1.5, borderColor: color }} />
      </View>
      <View style={{ width: 15, height: 10, borderRadius: 1.5, borderWidth: 1.8, borderColor: color }} />
    </View>
  ),
  Eye: ({ color }) => (
    <View style={{ width: 16, height: 10, borderRadius: 5, borderWidth: 1.8, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color }} />
    </View>
  ),
  ArrowRight: ({ color }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', width: 12, height: 12, justifyContent: 'center' }}>
      <View style={{ width: 8, height: 2, backgroundColor: color, marginRight: -3 }} />
      <View style={{ width: 6, height: 6, borderColor: color, borderTopWidth: 2, borderRightWidth: 2, transform: [{ rotate: '45deg' }] }} />
    </View>
  ),
  Hammer: ({ color }) => (
    <View style={{ width: 14, height: 14, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: 8, height: 5, backgroundColor: color, borderRadius: 1, transform: [{ rotate: '-45deg' }], position: 'absolute', top: 1, right: 1 }} />
      <View style={{ width: 2, height: 10, backgroundColor: color, transform: [{ rotate: '-45deg' }], position: 'absolute', bottom: 1, left: 3 }} />
    </View>
  ),
  Check: ({ color }) => (
    <View style={{ width: 9, height: 5, borderColor: color, borderLeftWidth: 2, borderBottomWidth: 2, transform: [{ rotate: '-45deg' }], marginTop: -2 }} />
  ),
  Alert: ({ color }) => (
    <View style={{ width: 14, height: 14, borderRadius: 7, borderWidth: 1.6, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color, fontSize: 9, fontWeight: '900', marginTop: -1 }}>!</Text>
    </View>
  ),
};

export default function SignUpScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [confirm, setConfirm] = useState('');
  const [showConf, setShowConf] = useState(false);
  const [username, setUsername] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [focusField, setFocusField] = useState(null);

  const shakeX = useRef(new Animated.Value(0)).current;
  const shake = () => {
    Animated.sequence([
      ...[-8, 8, -6, 6, 0].map(v =>
        Animated.timing(shakeX, { toValue: v, duration: 50, useNativeDriver: true })
      ),
    ]).start();
  };

  const isStrongPwd = pwd =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(pwd);

  const validateStep1 = () => {
    const e = {};
    if (!name.trim()) e.name = 'Full name is required';
    if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Valid email required';
    if (!password) e.password = 'Password required';
    else if (!isStrongPwd(password)) e.password = 'Requires 8+ chars, mixed casing & symbol';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    if (!agreed) e.terms = 'Agreement required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateUsername = () => {
    if (!/^[a-zA-Z0-9_-]{3,24}$/.test(username)) {
      setErrors({ username: '3–24 chars (letters, numbers, -, _)' });
      return false;
    }
    return true;
  };

  const goToStep2 = () => { if (validateStep1()) { setErrors({}); setStep(2); } else shake(); };

  const register = async () => {
    if (!validateUsername()) { shake(); return; }
    setLoading(true);
    try {
      const device_id = await getDeviceFingerprint();
      dispatch(setDeviceId(device_id));
      const payload = {
        email: email.trim().toLowerCase(),
        password,
        username: username.trim(),
        device_id,
      };
      if (referralCode.trim()) payload.referral_code = referralCode.trim();
      const { data } = await api.post('/auth/register', payload);
      dispatch(setCredentials({ token: data.token, userId: data.user_id, referralCode: data.referral_code }));
      dispatch(setProfile({ name: data.username, email: data.email }));
      showToast('Account created! Welcome to Zyphora 🚀', 'success');
    } catch (err) {
      const msg = err?.response?.data?.errors?.email?.[0] || 'Registration failed.';
      setErrors({ server: msg });
      shake();
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const letter = (username || name || '?')[0].toUpperCase();

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={s.flex}
      >
        <ScrollView 
          contentContainerStyle={s.scrollGrow} 
          bounces={false} 
          overScrollMode="never"
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.container}>
            
            {/* Header Action Bar */}
            <View style={s.navHeader}>
              <Pressable
                style={s.backBtn}
                onPress={() => step === 2 ? setStep(1) : navigation.goBack()}
              >
                <UIBoxIcon.Back color={C.w7} />
              </Pressable>
              {step === 1 && (
                <View style={s.stepPill}>
                  <Text style={s.stepPillText}>STEP 1 OF 2</Text>
                </View>
              )}
            </View>

            {/* Main Interactive Work Area */}
            <View style={s.centerSection}>
              {step === 1 ? (
                <View style={s.innerContent}>
                  <View style={s.headingZone}>
                    <Text style={s.titleText}>Create Account</Text>
                    <Text style={s.subtitleText}>Get started with your Zyphora profile node.</Text>
                  </View>

                  <Animated.View style={[s.formCard, { transform: [{ translateX: shakeX }] }]}>
                    
                    {/* Full Name Input */}
                    <View style={s.inputWrap}>
                      <View style={[s.inputRow, focusField === 'name' && s.inputRowFocused, errors.name && s.inputRowError]}>
                        <View style={s.iconWrapper}>
                          <UIBoxIcon.User color={focusField === 'name' ? C.accent : C.w3} />
                        </View>
                        <TextInput
                          style={s.fieldInput}
                          value={name}
                          onChangeText={setName}
                          placeholder="Full Name"
                          placeholderTextColor={C.w3}
                          onFocus={() => setFocusField('name')}
                          onBlur={() => setFocusField(null)}
                        />
                      </View>
                      {errors.name && <Text style={s.inlineFieldError}>{errors.name}</Text>}
                    </View>

                    {/* Email Input */}
                    <View style={s.inputWrap}>
                      <View style={[s.inputRow, focusField === 'email' && s.inputRowFocused, errors.email && s.inputRowError]}>
                        <View style={s.iconWrapper}>
                          <UIBoxIcon.Mail color={focusField === 'email' ? C.accent : C.w3} />
                        </View>
                        <TextInput
                          style={s.fieldInput}
                          value={email}
                          onChangeText={setEmail}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          placeholder="Email Address"
                          placeholderTextColor={C.w3}
                          onFocus={() => setFocusField('email')}
                          onBlur={() => setFocusField(null)}
                        />
                      </View>
                      {errors.email && <Text style={s.inlineFieldError}>{errors.email}</Text>}
                    </View>

                    {/* Password Input */}
                    <View style={s.inputWrap}>
                      <View style={[s.inputRow, focusField === 'password' && s.inputRowFocused, errors.password && s.inputRowError]}>
                        <View style={s.iconWrapper}>
                          <UIBoxIcon.Lock color={focusField === 'password' ? C.accent : C.w3} />
                        </View>
                        <TextInput
                          style={s.fieldInput}
                          value={password}
                          onChangeText={setPassword}
                          secureTextEntry={!showPass}
                          autoCapitalize="none"
                          placeholder="Password"
                          placeholderTextColor={C.w3}
                          onFocus={() => setFocusField('password')}
                          onBlur={() => setFocusField(null)}
                        />
                        <Pressable onPress={() => setShowPass(!showPass)} hitSlop={12} style={s.iconWrapperRight}>
                          <UIBoxIcon.Eye color={showPass ? C.accent : C.w5} />
                        </Pressable>
                      </View>
                      {errors.password && <Text style={s.inlineFieldError}>{errors.password}</Text>}
                    </View>

                    {/* Confirm Password Input */}
                    <View style={s.inputWrap}>
                      <View style={[s.inputRow, focusField === 'confirm' && s.inputRowFocused, errors.confirm && s.inputRowError]}>
                        <View style={s.iconWrapper}>
                          <UIBoxIcon.Shield color={focusField === 'confirm' ? C.accent : C.w3} />
                        </View>
                        <TextInput
                          style={s.fieldInput}
                          value={confirm}
                          onChangeText={setConfirm}
                          secureTextEntry={!showConf}
                          autoCapitalize="none"
                          placeholder="Confirm Password"
                          placeholderTextColor={C.w3}
                          onFocus={() => setFocusField('confirm')}
                          onBlur={() => setFocusField(null)}
                        />
                        <Pressable onPress={() => setShowConf(!showConf)} hitSlop={12} style={s.iconWrapperRight}>
                          <UIBoxIcon.Eye color={showConf ? C.accent : C.w5} />
                        </Pressable>
                      </View>
                      {errors.confirm && <Text style={s.inlineFieldError}>{errors.confirm}</Text>}
                    </View>

                    {/* Referral Input */}
                    <View style={s.inputWrap}>
                      <View style={[s.inputRow, focusField === 'referral' && s.inputRowFocused]}>
                        <View style={s.iconWrapper}>
                          <UIBoxIcon.Gift color={focusField === 'referral' ? C.accent : C.w3} />
                        </View>
                        <TextInput
                          style={s.fieldInput}
                          value={referralCode}
                          onChangeText={setReferralCode}
                          autoCapitalize="none"
                          placeholder="Referral Code (Optional)"
                          placeholderTextColor={C.w3}
                          onFocus={() => setFocusField('referral')}
                          onBlur={() => setFocusField(null)}
                        />
                      </View>
                    </View>

                    {/* Checkbox Rows */}
                    <Pressable style={s.termsRow} onPress={() => setAgreed(!agreed)}>
                      <View style={[s.checkboxBase, agreed && s.checkboxChecked]}>
                        {agreed && <UIBoxIcon.Check color={C.w} />}
                      </View>
                      <Text style={s.termsLabelText} numberOfLines={1}>
                        I agree to the <Text style={s.termsHighlight}>Terms</Text> & <Text style={s.termsHighlight}>Privacy Policy</Text>
                      </Text>
                    </Pressable>
                    
                    {errors.terms && (
                      <View style={s.errorBanner}>
                        <UIBoxIcon.Alert color={C.dn} />
                        <Text style={s.errorBannerText}>{errors.terms}</Text>
                      </View>
                    )}

                    {/* Action Trigger Button */}
                    <Pressable style={({ pressed }) => [s.actionButton, pressed && s.actionButtonPressed]} onPress={goToStep2}>
                      <View style={s.buttonContentLayout}>
                        <Text style={s.actionButtonLabel}>Continue</Text>
                        <View style={s.buttonIconWrapper}>
                          <UIBoxIcon.ArrowRight color={C.w} />
                        </View>
                      </View>
                    </Pressable>

                  </Animated.View>
                </View>
              ) : (
                <View style={s.innerContent}>
                  <View style={s.headingZone}>
                    <Text style={s.titleText}>Choose Handle</Text>
                    <Text style={s.subtitleText}>Your decentralized profile identifier identity.</Text>
                  </View>

                  {/* Profile Preview Card */}
                  <View style={s.previewCard}>
                    <View style={s.avatarCircle}>
                      <Text style={s.avatarLetter}>{letter}</Text>
                    </View>
                    <View style={s.previewMeta}>
                      <Text style={s.previewMetaName} numberOfLines={1}>{name || 'Your Name'}</Text>
                      <Text style={s.previewMetaHandle} numberOfLines={1}>@{username || 'username'}</Text>
                    </View>
                    <View style={s.previewPillTag}>
                      <Text style={s.previewPillTagText}>PREVIEW</Text>
                    </View>
                  </View>

                  <Animated.View style={[s.formCard, { transform: [{ translateX: shakeX }] }]}>
                    {errors.server && (
                      <View style={[s.errorBanner, { marginBottom: 12 }]}>
                        <UIBoxIcon.Alert color={C.dn} />
                        <Text style={s.errorBannerText}>{errors.server}</Text>
                      </View>
                    )}

                    <View style={s.inputWrap}>
                      <View style={[s.inputRow, focusField === 'username' && s.inputRowFocused, errors.username && s.inputRowError]}>
                        <View style={s.iconWrapper}>
                          <Text style={[s.atSymbolFallback, focusField === 'username' && { color: C.accent }]}>@</Text>
                        </View>
                        <TextInput
                          style={s.fieldInput}
                          value={username}
                          onChangeText={setUsername}
                          autoCapitalize="none"
                          placeholder="Username"
                          placeholderTextColor={C.w3}
                          onFocus={() => setFocusField('username')}
                          onBlur={() => setFocusField(null)}
                        />
                      </View>
                      {errors.username && <Text style={s.inlineFieldError}>{errors.username}</Text>}
                    </View>
                    
                    <Text style={s.formClarificationHint}>
                      Accepts letters, numbers, dashes and underscores (3-24 characters max).
                    </Text>

                    {/* Action Trigger Button */}
                    <Pressable 
                      style={({ pressed }) => [s.actionButton, pressed && s.actionButtonPressed, loading && s.actionButtonDisabled]} 
                      onPress={register}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color={C.w} size="small" />
                      ) : (
                        <View style={s.buttonContentLayout}>
                          <Text style={s.actionButtonLabel}>Start Mining</Text>
                          <View style={s.buttonIconWrapper}>
                            <UIBoxIcon.Hammer color={C.w} />
                          </View>
                        </View>
                      )}
                    </Pressable>
                  </Animated.View>
                </View>
              )}
            </View>

            {/* Base Footer Section */}
            <View style={s.footerContainer}>
              <Text style={s.footerMetaLabel}>Already have an account? </Text>
              <Pressable onPress={() => navigation.navigate('SignIn')} hitSlop={12}>
                <Text style={s.footerActionLinkText}>Sign In</Text>
              </Pressable>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ─── Stylesheets ────────────────────────────────────────────────── */
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.b0 },
  flex: { flex: 1 },
  scrollGrow: { flexGrow: 1 },
  
  container: { 
    flex: 1, 
    paddingHorizontal: 20, 
    justifyContent: 'space-between',
    minHeight: SCREEN_HEIGHT - (Platform.OS === 'ios' ? 90 : 60),
    paddingBottom: Platform.OS === 'ios' ? 10 : 20,
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 10,
  },
  innerContent: {
    width: '100%',
  },
  navHeader: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: C.b1,
    borderWidth: 1,
    borderColor: C.ln2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepPill: {
    backgroundColor: C.accentDim,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  stepPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: C.accent,
    letterSpacing: 0.5,
  },
  headingZone: {
    marginBottom: SCREEN_HEIGHT < 700 ? 12 : 18,
    marginTop: 6,
  },
  titleText: {
    fontSize: SCREEN_HEIGHT < 700 ? 22 : 25,
    fontWeight: '800',
    color: C.w,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 13,
    color: C.w5,
    fontWeight: '400',
  },
  formCard: {
    backgroundColor: C.b2,
    borderWidth: 1,
    borderColor: C.ln,
    borderRadius: 20,
    padding: SCREEN_HEIGHT < 700 ? 14 : 18,
  },
  inputWrap: {
    marginBottom: SCREEN_HEIGHT < 700 ? 8 : 11,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: SCREEN_HEIGHT < 700 ? 46 : 50,
    borderRadius: 12,
    backgroundColor: C.b0,
    borderWidth: 1,
    borderColor: C.ln2,
    paddingHorizontal: 14,
  },
  inputRowFocused: {
    borderColor: C.accent,
  },
  inputRowError: {
    borderColor: C.dn,
  },
  iconWrapper: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  iconWrapperRight: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  atSymbolFallback: {
    fontSize: 16,
    fontWeight: '600',
    color: C.w3,
  },
  fieldInput: {
    flex: 1,
    fontSize: 14,
    color: C.w,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    padding: 0, 
  },
  inlineFieldError: {
    fontSize: 10,
    color: C.dn,
    marginTop: 3,
    fontWeight: '500',
    paddingLeft: 4,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: SCREEN_HEIGHT < 700 ? 10 : 14,
  },
  checkboxBase: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: C.w3,
    backgroundColor: C.b0,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: C.accent,
    borderColor: C.accent,
  },
  termsLabelText: {
    flex: 1,
    fontSize: 12,
    color: C.w5,
  },
  termsHighlight: {
    color: C.w,
    fontWeight: '600',
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.b1,
    borderWidth: 1,
    borderColor: C.ln2,
    borderRadius: 16,
    padding: 12,
    marginBottom: SCREEN_HEIGHT < 700 ? 12 : 16,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.accentDim,
    borderWidth: 1.5,
    borderColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 16,
    fontWeight: '800',
    color: C.w,
  },
  previewMeta: {
    flex: 1,
    paddingHorizontal: 12,
  },
  previewMetaName: {
    fontSize: 14,
    fontWeight: '700',
    color: C.w,
    marginBottom: 1,
  },
  previewMetaHandle: {
    fontSize: 12,
    color: C.w5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  previewPillTag: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: C.ln2,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  previewPillTagText: {
    fontSize: 8,
    fontWeight: '700',
    color: C.w7,
  },
  formClarificationHint: {
    fontSize: 11,
    color: C.w3,
    marginTop: -2,
    marginBottom: SCREEN_HEIGHT < 700 ? 12 : 16,
    lineHeight: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239,68,68,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.15)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 11,
    color: C.dn,
    fontWeight: '500',
  },
  actionButton: {
    height: SCREEN_HEIGHT < 700 ? 46 : 50,
    borderRadius: 12,
    backgroundColor: C.accent,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
    marginTop: SCREEN_HEIGHT < 700 ? 2 : 6,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.995 }],
  },
  actionButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  buttonContentLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: C.w,
    letterSpacing: 0.2,
  },
  buttonIconWrapper: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
  },
  footerMetaLabel: {
    fontSize: 13,
    color: C.w5,
  },
  footerActionLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.accent,
  },
});