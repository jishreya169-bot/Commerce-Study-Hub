import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePickerNative from '@react-native-community/datetimepicker';

// A helper for React Native Web to render HTML tags
let createElement: any = null;
if (Platform.OS === 'web') {
  try {
    const rnw = require('react-native-web');
    createElement = rnw.createElement || require('react-native').createElement;
  } catch (e) {
    createElement = require('react-native').createElement;
  }
}

interface DateTimePickerProps {
  value: string; // DD-MM-YYYY or HH:MM AM/PM
  onChange: (value: string) => void;
  mode?: 'date' | 'time';
  placeholder?: string;
}

export default function DateTimePicker({ value, onChange, mode = 'date', placeholder }: DateTimePickerProps) {
  const [show, setShow] = useState(false);
  
  // Parse incoming value to Date object for the picker
  let dateObj = new Date();
  if (value) {
    if (mode === 'date') {
      if (value.includes('-')) {
        const parts = value.split('-');
        if (parts[0].length === 2) {
          // DD-MM-YYYY
          dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        } else if (parts[0].length === 4) {
          // YYYY-MM-DD
          dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        }
      }
    } else if (mode === 'time') {
      const isPM = value.toLowerCase().includes('pm');
      const timeParts = value.replace(/am|pm/i, '').trim().split(':');
      if (timeParts.length === 2) {
        let hours = parseInt(timeParts[0]);
        if (isPM && hours < 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;
        dateObj.setHours(hours, parseInt(timeParts[1]));
      }
    }
  }

  const formatValue = (d: Date) => {
    if (mode === 'date') {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    } else {
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const strTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
      return strTime;
    }
  };

  const handleNativeChange = (event: any, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(formatValue(selectedDate));
    }
  };

  if (Platform.OS === 'web' && createElement) {
    // Generate valid YYYY-MM-DD for native <input type="date">
    // Generate valid HH:MM for native <input type="time">
    let webValue = '';
    if (value && mode === 'date') {
      webValue = `${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2,'0')}-${String(dateObj.getDate()).padStart(2,'0')}`;
    } else if (value && mode === 'time') {
      webValue = `${String(dateObj.getHours()).padStart(2,'0')}:${String(dateObj.getMinutes()).padStart(2,'0')}`;
    }

    return (
      <View style={styles.container}>
        {createElement('input', {
          type: mode,
          value: webValue,
          onChange: (e: any) => {
            const val = e.target.value;
            if (val) {
              if (mode === 'date') {
                const parts = val.split('-');
                if (parts.length === 3) {
                  onChange(`${parts[2]}-${parts[1]}-${parts[0]}`);
                }
              } else {
                const parts = val.split(':');
                if (parts.length >= 2) {
                  const d = new Date();
                  d.setHours(parseInt(parts[0]), parseInt(parts[1]));
                  onChange(formatValue(d));
                }
              }
            } else {
              onChange('');
            }
          },
          style: {
            width: '100%',
            height: '50px',
            padding: '14px 16px',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            backgroundColor: '#F8FAFC',
            fontFamily: 'inherit',
            fontSize: '14px',
            color: '#0F172A',
            outline: 'none',
            boxSizing: 'border-box'
          }
        })}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.inputWrapper} 
        onPress={() => setShow(true)}
      >
        <Text style={[styles.text, !value && styles.placeholder]}>
          {value || placeholder || `Select ${mode}`}
        </Text>
      </TouchableOpacity>

      {show && (
        <DateTimePickerNative
          value={dateObj}
          mode={mode}
          display="default"
          onChange={handleNativeChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  inputWrapper: {
    backgroundColor: "#F8FAFC", 
    borderWidth: 1, 
    borderColor: "#E2E8F0", 
    borderRadius: 14, 
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    justifyContent: 'center',
    height: 50
  },
  text: {
    fontSize: 14, 
    fontFamily: "Poppins_400Regular", 
    color: "#0F172A"
  },
  placeholder: {
    color: "#94A3B8"
  }
});
