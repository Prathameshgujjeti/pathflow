import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

export type MultiSelectOption = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  options: MultiSelectOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({ options, selectedValues, onToggle }) => {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = selectedValues.includes(option.value);
        
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.chip,
              isSelected && styles.chipSelected
            ]}
            onPress={() => onToggle(option.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chip: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipSelected: {
    backgroundColor: theme.colors.surfaceHighlight,
    borderColor: theme.colors.primary,
  },
  label: {
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
  },
  labelSelected: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fonts.semiBold,
  },
});
