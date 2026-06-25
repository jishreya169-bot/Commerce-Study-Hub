import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  themeColor?: string;
  onSave: (newPassword: string) => Promise<void>;
}

export default function ChangePasswordModal({ visible, onClose, userName, themeColor = "#38BDF8", onSave }: ChangePasswordModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!newPassword) {
      alert("Please enter a new password");
      return;
    }
    setLoading(true);
    try {
      await onSave(newPassword);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setNewPassword("");
      onClose();
    } catch (e) {
      console.error(e);
      alert("Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewPassword("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          
          <View style={styles.header}>
            <Text style={styles.title}>Change Password</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeIcon}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Set a new password for <Text style={{ fontFamily: "Poppins_600SemiBold", color: "#111827" }}>{userName}</Text>.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={[styles.input, { borderColor: themeColor + "40" }]}
              placeholder="Enter new password"
              placeholderTextColor="#9CA3AF"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, { backgroundColor: themeColor }, loading && { opacity: 0.7 }]} 
            onPress={handleSave} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitText}>Update Password</Text>
            )}
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  container: { width: '100%', maxWidth: 400, backgroundColor: '#FFF', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#111827' },
  closeIcon: { padding: 4 },
  subtitle: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#6B7280', marginBottom: 20, lineHeight: 22 },
  
  inputGroup: { marginBottom: 24 },
  label: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#374151', marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, height: 52, fontFamily: 'Poppins_500Medium', fontSize: 15, color: '#111827' },
  
  submitBtn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  submitText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#FFF' }
});
