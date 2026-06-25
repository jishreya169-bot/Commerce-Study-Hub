import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD
  onSelect: (dateStr: string) => void;
}

export default function CalendarModal({ visible, onClose, selectedDate, onSelect }: CalendarModalProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleSelectDate = (day: number) => {
    Haptics.selectionAsync();
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    // Adjust for local timezone offset when getting ISO string
    const offset = d.getTimezoneOffset();
    d.setMinutes(d.getMinutes() - offset);
    
    onSelect(d.toISOString().split('T')[0]);
    onClose();
  };

  const renderDays = () => {
    const days = [];
    const todayStr = new Date().toISOString().split('T')[0];

    // Empty slots for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    // Actual days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      const offset = d.getTimezoneOffset();
      d.setMinutes(d.getMinutes() - offset);
      const dateStr = d.toISOString().split('T')[0];

      const isSelected = selectedDate === dateStr;
      const isToday = todayStr === dateStr;

      days.push(
        <TouchableOpacity
          key={`day-${i}`}
          style={[styles.dayCell, isSelected && styles.dayCellSelected]}
          onPress={() => handleSelectDate(i)}
        >
          <Text style={[styles.dayText, isSelected && styles.dayTextSelected, isToday && !isSelected && styles.dayTextToday]}>
            {i}
          </Text>
        </TouchableOpacity>
      );
    }
    return days;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
              <Ionicons name="chevron-back" size={24} color="#111827" />
            </TouchableOpacity>
            
            <Text style={styles.monthLabel}>
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
            
            <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
              <Ionicons name="chevron-forward" size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* Weekdays */}
          <View style={styles.weekdaysRow}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(w => (
              <Text key={w} style={styles.weekdayText}>{w}</Text>
            ))}
          </View>

          {/* Grid */}
          <View style={styles.daysGrid}>
            {renderDays()}
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Cancel</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  container: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  monthLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#111827'
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10
  },
  weekdayText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#9CA3AF',
    width: 40,
    textAlign: 'center'
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start'
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    borderRadius: 100
  },
  dayCellSelected: {
    backgroundColor: '#38BDF8'
  },
  dayText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: '#111827'
  },
  dayTextSelected: {
    color: '#FFF',
    fontFamily: 'Poppins_700Bold'
  },
  dayTextToday: {
    color: '#38BDF8',
    fontFamily: 'Poppins_700Bold'
  },
  closeBtn: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 16
  },
  closeBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#4B5563'
  }
});
