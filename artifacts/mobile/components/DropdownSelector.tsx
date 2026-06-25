import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList, TextInput, KeyboardAvoidingView, Platform, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

export interface DropdownOption {
  id: string;
  label: string;
}

interface DropdownSelectorProps {
  label: string;
  placeholder?: string;
  options: DropdownOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  icon?: keyof typeof Ionicons.glyphMap;
  allowAdd?: boolean;
}

export default function DropdownSelector({
  label,
  placeholder = "Select an option",
  options,
  selectedValue,
  onSelect,
  icon,
  allowAdd = false
}: DropdownSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedOption = options.find(o => o.id === selectedValue || o.label === selectedValue);
  const displayValue = selectedOption ? selectedOption.label : selectedValue;

  const filteredOptions = options.filter(o => 
    o.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (val: string) => {
    Haptics.selectionAsync();
    onSelect(val);
    setModalVisible(false);
    setSearchQuery("");
  };

  const exactMatch = options.some(o => o.label.toLowerCase() === searchQuery.trim().toLowerCase());
  const showAddOption = allowAdd && searchQuery.trim().length > 0 && !exactMatch;

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity 
          style={styles.selectorBtn} 
          activeOpacity={0.7}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setModalVisible(true);
          }}
        >
          {icon && <Ionicons name={icon} size={18} color="#64748B" style={styles.leftIcon} />}
          <Text style={[styles.selectorText, !displayValue && styles.placeholderText]}>
            {displayValue || placeholder}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close-circle" size={28} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#64748B" />
              <TextInput 
                style={styles.searchInput}
                placeholder={`Search ${label.toLowerCase()}...`}
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={false}
              />
            </View>

            <FlatList 
              data={filteredOptions}
              keyExtractor={(item, index) => item.id || index.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ListHeaderComponent={
                showAddOption ? (
                  <TouchableOpacity 
                    style={[styles.optionItem, { borderColor: "#0EA5E9", borderStyle: "dashed", backgroundColor: "#F0F9FF", marginBottom: 12 }]}
                    onPress={() => handleSelect(searchQuery.trim())}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <Ionicons name="add-circle" size={22} color="#0EA5E9" />
                      <Text style={[styles.optionText, { color: "#0EA5E9", fontFamily: "Poppins_600SemiBold" }]}>
                        Add "{searchQuery.trim()}"
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : null
              }
              renderItem={({ item }) => {
                const isSelected = selectedValue === item.id || selectedValue === item.label;
                return (
                  <TouchableOpacity 
                    style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                    onPress={() => handleSelect(item.id)} // Returning ID or label depends on usage, we usually prefer ID but for some forms we use string labels. Let's return ID which can be label.
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {item.label}
                    </Text>
                    {isSelected && <Ionicons name="checkmark-circle" size={20} color="#0EA5E9" />}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No options found.</Text>
                </View>
              }
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#334155",
    marginBottom: 8,
    marginLeft: 4,
  },
  selectorBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  leftIcon: {
    marginRight: 10,
  },
  selectorText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: "#0F172A",
  },
  placeholderText: {
    color: "#94A3B8",
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: "80%",
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: "#0F172A",
  },
  closeBtn: {
    padding: 4,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: "#0F172A",
    padding: 0,
  },
  listContent: {
    paddingBottom: 40,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  optionItemSelected: {
    backgroundColor: "#F0F9FF",
    borderColor: "#BAE6FD",
  },
  optionText: {
    fontSize: 15,
    fontFamily: "Poppins_500Medium",
    color: "#334155",
  },
  optionTextSelected: {
    color: "#0EA5E9",
    fontFamily: "Poppins_600SemiBold",
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: "#94A3B8",
  },
});
