import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  FlatList,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "@/src/constants/Colors";
export interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  label?: string;
  placeholder?: string;
  value?: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  searchable?: boolean;
  disabled?: boolean;
  modalTitle?: string;
}

export function Dropdown({
  label,
  placeholder = "Select an option",
  value,
  options,
  onChange,
  searchable = false,
  disabled = false,
  modalTitle = "Select an option",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(q));
  }, [options, query, searchable]);

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
    setQuery("");
  };

  return (
    <View>
      {label ? (
        <Text className="text-sm font-semibold text-text mb-2">{label}</Text>
      ) : null}

      <TouchableOpacity
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={0.85}
        className={`flex-row items-center justify-between border border-border rounded-xl px-3 py-2 ${
          disabled ? "bg-gray-100" : "bg-white"
        }`}
      >
        <Text
          className={`text-sm ${selected ? "text-text" : "text-text-secondary"}`}
        >
          {selected?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color={Colors.text.tertiary} />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          onPress={() => setOpen(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(15, 23, 42, 0.35)",
            justifyContent: "flex-end",
          }}
        >
          <Pressable
            onPress={() => undefined}
            style={{
              backgroundColor: Colors.surface.DEFAULT,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 32,
              maxHeight: "70%",
            }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-semibold text-text">
                {modalTitle}
              </Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close" size={20} color={Colors.text.tertiary} />
              </TouchableOpacity>
            </View>

            {searchable ? (
              <View className="flex-row items-center border border-border rounded-xl px-3 py-2 mb-3">
                <Ionicons name="search-outline" size={16} color={Colors.text.tertiary} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search"
                  placeholderTextColor={Colors.text.tertiary}
                  className="ml-2 flex-1 text-sm text-text"
                />
              </View>
            ) : null}

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <TouchableOpacity
                    onPress={() => handleSelect(item.value)}
                    className={`flex-row items-center justify-between px-4 py-3 rounded-xl ${
                      isSelected ? "bg-primary-50" : "bg-slate-50"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        isSelected ? "text-primary" : "text-text"
                      }`}
                    >
                      {item.label}
                    </Text>
                    {isSelected ? (
                      <Ionicons name="checkmark" size={18} color={Colors.primary.DEFAULT} />
                    ) : null}
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export interface CountryCodeOption {
  label: string;
  code: string;
  flag: string;
}

interface CountryCodeDropdownProps {
  value?: string;
  options: CountryCodeOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CountryCodeDropdown({
  value,
  options,
  onChange,
  disabled = false,
}: CountryCodeDropdownProps) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(
    () => options.find((option) => option.code === value) ?? options[0],
    [options, value],
  );

  return (
    <View>
      <TouchableOpacity
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={0.85}
        className={`flex-row items-center justify-between border border-border rounded-xl px-3 py-2 ${
          disabled ? "bg-gray-100" : "bg-white"
        }`}
      >
        <Text className="text-sm text-text">
          {selected?.flag} {selected?.code}
        </Text>
        <Ionicons name="chevron-down" size={16} color={Colors.text.tertiary} />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          onPress={() => setOpen(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(15, 23, 42, 0.35)",
            justifyContent: "flex-end",
          }}
        >
          <Pressable
            onPress={() => undefined}
            style={{
              backgroundColor: Colors.surface.DEFAULT,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 32,
              maxHeight: "70%",
            }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-semibold text-text">
                Select Country Code
              </Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close" size={20} color={Colors.text.tertiary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              renderItem={({ item }) => {
                const isSelected = item.code === selected?.code;
                return (
                  <TouchableOpacity
                    onPress={() => {
                      onChange(item.code);
                      setOpen(false);
                    }}
                    className={`flex-row items-center justify-between px-4 py-3 rounded-xl ${
                      isSelected ? "bg-primary-50" : "bg-slate-50"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        isSelected ? "text-primary" : "text-text"
                      }`}
                    >
                      {item.flag} {item.label} ({item.code})
                    </Text>
                    {isSelected ? (
                      <Ionicons name="checkmark" size={18} color={Colors.primary.DEFAULT} />
                    ) : null}
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

