import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}

export function SubjectChip({ label, selected, onPress, color }: Props) {
  const colors = useColors();
  const activeColor = color ?? colors.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? activeColor : colors.card,
          borderColor: selected ? activeColor : colors.border,
        },
      ]}
    >
      <Text style={[styles.label, { color: selected ? "#FFFFFF" : colors.mutedForeground }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 22,
    borderWidth: 1,
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  label: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
  },
});
