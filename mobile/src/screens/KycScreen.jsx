import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Svg, { Path, Rect, Circle, Check } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from '../components/SharedComponents';
import { useDispatch, useSelector } from 'react-redux';
import { fetchKycStatus, submitKycDocuments } from '../redux/slices/kycSlice';

export default function KycScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const topPadding = insets.top + 10;
  const dispatch = useDispatch();
  
  const { loading, kycData, error } = useSelector((state) => state.kyc || { loading: false, kycData: null, error: null });
  
  const [kycSteps, setKycSteps] = useState([
    { label: 'Mobile', done: false },
    { label: 'Identity', done: false },
    { label: 'Liveness', done: false },
  ]);
  
  const [selectedDocType, setSelectedDocType] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({ front: 0, back: 0, selfie: 0 });

  useEffect(() => {
    loadKycStatus();
  }, []);

  useEffect(() => {
    if (kycData?.steps) {
      setKycSteps(kycData.steps);
    }
  }, [kycData]);

  const loadKycStatus = async () => {
    await dispatch(fetchKycStatus());
  };

  const handleInitiateKyc = async () => {
    try {
      // In a real app, this would call the API
      Alert.alert(
        'Start KYC Verification',
        'This will begin your identity verification process. You\'ll need a valid ID and a quiet place for the liveness check.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Continue', 
            onPress: () => {
              // Navigate to document upload or start the process
              console.log('Starting KYC process');
            }
          },
        ]
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to initiate KYC. Please try again.');
    }
  };

  const handleSubmitDocuments = async () => {
    if (!selectedDocType) {
      Alert.alert('Select Document', 'Please select a document type first.');
      return;
    }

    try {
      // Simulate document submission
      setUploadProgress(prev => ({ ...prev, front: 50 }));
      setTimeout(() => setUploadProgress(prev => ({ ...prev, front: 100, back: 50 })), 500);
      setTimeout(() => setUploadProgress(prev => ({ ...prev, back: 100, selfie: 50 })), 1000);
      setTimeout(() => setUploadProgress(prev => ({ ...prev, selfie: 100 })), 1500);
      
      setTimeout(() => {
        Alert.alert(
          'Documents Submitted!',
          'Your documents are under review. This typically takes 24-48 hours.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }, 2000);
    } catch (err) {
      Alert.alert('Error', 'Failed to submit documents. Please try again.');
    }
  };

  const docTypes = [
    { id: 'passport', label: 'Passport', icon: '🛂' },
    { id: 'national_id', label: 'National ID', icon: '🆔' },
    { id: 'drivers_license', label: "Driver's License", icon: '🪪' },
  ];

  const completedCount = kycSteps.filter((s) => s.done).length;
  const isComplete = completedCount === kycSteps.length;
  const isPending = kycData?.status === 'pending' || kycData?.status === 'reviewing';
  const isVerified = kycData?.status === 'verified' || kycData?.status === 'approved';

  const renderStepIndicator = () => (
    <View className="flex-row items-center justify-between mb-6">
      {kycSteps.map((step, idx) => (
        <React.Fragment key={idx}>
          <View className="items-center flex-1">
            <View
              className={`w-10 h-10 rounded-full items-center justify-center ${
                step.done
                  ? 'bg-emerald-400 shadow-lg shadow-emerald-400/30'
                  : 'bg-white/[0.08] border border-white/[0.15]'
              }`}
            >
              {step.done ? (
                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round">
                  <Path d="M20 6 9 17 4 12" />
                </Svg>
              ) : (
                <Text className="text-[13px] font-bold text-white/50">{idx + 1}</Text>
              )}
            </View>
            <Text
              className={`text-[11px] mt-2 font-medium ${
                step.done ? 'text-white/80' : 'text-white/30'
              }`}
            >
              {step.label}
            </Text>
          </View>

          {idx < kycSteps.length - 1 && (
            <View className="h-px flex-1 bg-white/[0.08]" style={{ marginBottom: 28, marginHorizontal: 4 }} />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  const renderDocumentSelection = () => (
    <View className="mb-6">
      <Text className="text-[14px] font-semibold text-white/90 mb-3">Select Document Type</Text>
      <View className="flex-row flex-wrap gap-3">
        {docTypes.map((doc) => (
          <TouchableOpacity
            key={doc.id}
            className={`w-[48%] p-4 rounded-2xl border ${
              selectedDocType === doc.id
                ? 'bg-indigo-500/20 border-indigo-400'
                : 'bg-white/[0.05] border-white/[0.1]'
            }`}
            onPress={() => setSelectedDocType(doc.id)}
            activeOpacity={0.7}
          >
            <Text className="text-[24px] mb-2">{doc.icon}</Text>
            <Text className={`text-[12px] font-medium ${
              selectedDocType === doc.id ? 'text-indigo-300' : 'text-white/70'
            }`}>{doc.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderUploadSection = () => (
    <View className="mb-6">
      <Text className="text-[14px] font-semibold text-white/90 mb-3">Upload Documents</Text>
      
      {/* Front Side */}
      <TouchableOpacity 
        className="bg-white/[0.05] border border-white/[0.1] rounded-xl p-4 mb-3"
        activeOpacity={0.7}
        onPress={() => console.log('Upload front')}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-lg bg-indigo-500/20 items-center justify-center">
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2">
                <Rect x="3" y="3" width="18" height="18" rx="2" />
                <Path d="M12 8v8M8 12h8" />
              </Svg>
            </View>
            <View>
              <Text className="text-[13px] font-medium text-white/90">Document Front</Text>
              <Text className="text-[11px] text-white/40">Clear photo of front side</Text>
            </View>
          </View>
          {uploadProgress.front === 100 ? (
            <View className="w-6 h-6 rounded-full bg-emerald-400 items-center justify-center">
              <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3">
                <Path d="M20 6 9 17 4 12" />
              </Svg>
            </View>
          ) : (
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white/40" strokeWidth="2">
              <Path d="M12 5v14M5 12h14" />
            </Svg>
          )}
        </View>
        {uploadProgress.front > 0 && uploadProgress.front < 100 && (
          <View className="mt-3 h-1 bg-white/[0.1] rounded-full overflow-hidden">
            <View className="h-full bg-indigo-400" style={{ width: `${uploadProgress.front}%` }} />
          </View>
        )}
      </TouchableOpacity>

      {/* Back Side */}
      <TouchableOpacity 
        className="bg-white/[0.05] border border-white/[0.1] rounded-xl p-4 mb-3"
        activeOpacity={0.7}
        onPress={() => console.log('Upload back')}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-lg bg-purple-500/20 items-center justify-center">
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2">
                <Rect x="3" y="3" width="18" height="18" rx="2" />
                <Path d="M12 8v8M8 12h8" />
              </Svg>
            </View>
            <View>
              <Text className="text-[13px] font-medium text-white/90">Document Back</Text>
              <Text className="text-[11px] text-white/40">Clear photo of back side</Text>
            </View>
          </View>
          {uploadProgress.back === 100 ? (
            <View className="w-6 h-6 rounded-full bg-emerald-400 items-center justify-center">
              <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3">
                <Path d="M20 6 9 17 4 12" />
              </Svg>
            </View>
          ) : (
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white/40" strokeWidth="2">
              <Path d="M12 5v14M5 12h14" />
            </Svg>
          )}
        </View>
        {uploadProgress.back > 0 && uploadProgress.back < 100 && (
          <View className="mt-3 h-1 bg-white/[0.1] rounded-full overflow-hidden">
            <View className="h-full bg-purple-400" style={{ width: `${uploadProgress.back}%` }} />
          </View>
        )}
      </TouchableOpacity>

      {/* Selfie */}
      <TouchableOpacity 
        className="bg-white/[0.05] border border-white/[0.1] rounded-xl p-4"
        activeOpacity={0.7}
        onPress={() => console.log('Take selfie')}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-lg bg-pink-500/20 items-center justify-center">
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F472B6" strokeWidth="2">
                <Circle cx="12" cy="8" r="5" />
                <Path d="M20 21a8 8 0 10-16 0" />
              </Svg>
            </View>
            <View>
              <Text className="text-[13px] font-medium text-white/90">Selfie / Liveness</Text>
              <Text className="text-[11px] text-white/40">Look at camera and blink</Text>
            </View>
          </View>
          {uploadProgress.selfie === 100 ? (
            <View className="w-6 h-6 rounded-full bg-emerald-400 items-center justify-center">
              <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3">
                <Path d="M20 6 9 17 4 12" />
              </Svg>
            </View>
          ) : (
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white/40" strokeWidth="2">
              <Path d="M12 5v14M5 12h14" />
            </Svg>
          )}
        </View>
        {uploadProgress.selfie > 0 && uploadProgress.selfie < 100 && (
          <View className="mt-3 h-1 bg-white/[0.1] rounded-full overflow-hidden">
            <View className="h-full bg-pink-400" style={{ width: `${uploadProgress.selfie}%` }} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366F1" />
          <Text className="text-white/60 mt-4">Loading KYC status...</Text>
        </View>
      );
    }

    if (isVerified) {
      return (
        <View className="items-center py-8">
          <View className="w-20 h-20 rounded-full bg-emerald-400/20 border border-emerald-400/30 items-center justify-center mb-4">
            <Svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2">
              <Path d="M20 6 9 17 4 12" />
            </Svg>
          </View>
          <Text className="text-[22px] font-bold text-white mb-2">Verified!</Text>
          <Text className="text-[14px] text-white/60 text-center max-w-[280px]">
            Your identity has been verified. You now have full access to all features.
          </Text>
          <View className="mt-6 px-6 py-3 bg-emerald-400/20 border border-emerald-400/30 rounded-full">
            <Text className="text-[12px] font-semibold text-emerald-300">Tier {kycData?.kyc_tier || 1} Approved</Text>
          </View>
        </View>
      );
    }

    if (isPending || kycData?.status === 'reviewing') {
      return (
        <View className="items-center py-8">
          <View className="w-20 h-20 rounded-full bg-amber-400/20 border border-amber-400/30 items-center justify-center mb-4">
            <ActivityIndicator size="large" color="#FBBF24" />
          </View>
          <Text className="text-[22px] font-bold text-white mb-2">Under Review</Text>
          <Text className="text-[14px] text-white/60 text-center max-w-[280px]">
            Your documents are being reviewed. This typically takes 24-48 hours.
          </Text>
          <View className="mt-6 px-6 py-3 bg-amber-400/20 border border-amber-400/30 rounded-full">
            <Text className="text-[12px] font-semibold text-amber-300">Pending Approval</Text>
          </View>
        </View>
      );
    }

    // Not started or in progress
    return (
      <>
        {renderStepIndicator()}
        
        {!kycData || kycData.status === 'not_started' ? (
          <View className="bg-white/[0.05] border border-white/[0.1] rounded-2xl p-5 mb-6">
            <Text className="text-[16px] font-bold text-white mb-2">Start Verification</Text>
            <Text className="text-[13px] text-white/50 mb-4 leading-5">
              Complete all three steps to verify your identity. This helps us ensure the security of your account and comply with regulations.
            </Text>
            <TouchableOpacity
              className="bg-gradient-to-r from-indigo-500 to-purple-500 py-3.5 rounded-xl items-center"
              onPress={handleInitiateKyc}
              activeOpacity={0.8}
            >
              <Text className="text-[14px] font-bold text-white">Begin Verification</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {renderDocumentSelection()}
            {renderUploadSection()}
            
            <TouchableOpacity
              className="bg-gradient-to-r from-indigo-500 to-purple-500 py-3.5 rounded-xl items-center mt-4"
              onPress={handleSubmitDocuments}
              activeOpacity={0.8}
            >
              <Text className="text-[14px] font-bold text-white">Submit Documents</Text>
            </TouchableOpacity>
          </>
        )}
      </>
    );
  };

  return (
    <View className="flex-1 bg-[#070B14]" style={{ paddingTop: topPadding }}>
      <StatusBar />
      
      {/* Header */}
      <View className="flex-row items-center px-5 mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <Path d="M19 12H5M12 19l-7-7 7-7" />
          </Svg>
        </TouchableOpacity>
        <Text className="text-[20px] font-bold text-white flex-1 text-center pr-10">KYC Verification</Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Completion Summary Card */}
        <View className="bg-[#111827] border border-white/[0.1] rounded-2xl p-5 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Progress</Text>
            <View className={`px-3 py-1 rounded-full ${
              isVerified ? 'bg-emerald-400/20' : isPending ? 'bg-amber-400/20' : 'bg-white/[0.05]'
            }`}>
              <Text className={`text-[10px] font-medium ${
                isVerified ? 'text-emerald-300' : isPending ? 'text-amber-300' : 'text-white/60'
              }`}>
                {isVerified ? 'Verified' : isPending ? 'Pending' : `${completedCount}/${kycSteps.length} Steps`}
              </Text>
            </View>
          </View>
          
          {renderContent()}
        </View>

        {/* Info Box */}
        <View className="bg-indigo-500/10 border border-indigo-400/20 rounded-xl p-4 mb-6">
          <View className="flex-row items-start gap-3">
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2">
              <Circle cx="12" cy="12" r="10" />
              <Path d="M12 16v-4M12 8h.01" />
            </Svg>
            <View className="flex-1">
              <Text className="text-[12px] font-semibold text-indigo-300 mb-1">Important Tips</Text>
              <Text className="text-[11px] text-indigo-200/70 leading-4">
                • Ensure good lighting when taking photos{'\n'}
                • Keep your document within the frame{'\n'}
                • Remove glasses or face coverings for selfie
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
