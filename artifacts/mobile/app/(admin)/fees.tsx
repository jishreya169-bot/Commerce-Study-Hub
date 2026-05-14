import React, { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Platform, Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";

const FEE_RECORDS = [
  { id: "f1", name: "Priya Sharma", roll: "2401", class: "XII-A", amount: 18000, paid: 18000, dueDate: "Jul 10, 2025", status: "paid", avatar: "PS", color: "#5B9BD5" },
  { id: "f2", name: "Rahul Mehta", roll: "2402", class: "XII-A", amount: 18000, paid: 18000, dueDate: "Jul 10, 2025", status: "paid", avatar: "RM", color: "#5BAD9B" },
  { id: "f3", name: "Ananya Kapoor", roll: "2403", class: "XII-B", amount: 22000, paid: 22000, dueDate: "Jul 10, 2025", status: "paid", avatar: "AK", color: "#9B7BC4" },
  { id: "f4", name: "Vikram Singh", roll: "2404", class: "XII-A", amount: 18000, paid: 0, dueDate: "Jul 10, 2025", status: "overdue", avatar: "VS", color: "#E53E3E" },
  { id: "f5", name: "Deepika Nair", roll: "2405", class: "XII-B", amount: 22000, paid: 22000, dueDate: "Aug 10, 2025", status: "paid", avatar: "DN", color: "#48BB78" },
  { id: "f6", name: "Arjun Patel", roll: "2406", class: "XII-C", amount: 18000, paid: 9000, dueDate: "Aug 10, 2025", status: "partial", avatar: "AP", color: "#D69E2E" },
  { id: "f7", name: "Sneha Gupta", roll: "2407", class: "XII-C", amount: 18000, paid: 18000, dueDate: "Aug 10, 2025", status: "paid", avatar: "SG", color: "#BF7B5B" },
  { id: "f8", name: "Karan Verma", roll: "2408", class: "XI-A", amount: 16000, paid: 0, dueDate: "Jul 10, 2025", status: "overdue", avatar: "KV", color: "#E53E3E" },
  { id: "f9", name: "Pooja Mishra", roll: "2409", class: "XI-B", amount: 16000, paid: 16000, dueDate: "Aug 10, 2025", status: "paid", avatar: "PM", color: "#7B8EBF" },
  { id: "f10", name: "Rohan Das", roll: "2410", class: "XI-A", amount: 16000, paid: 8000, dueDate: "Aug 10, 2025", status: "partial", avatar: "RD", color: "#D69E2E" },
];

const STATUS_FILTERS = ["All", "Paid", "Partial", "Overdue"];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  paid: { label: "Paid", color: "#48BB78", bg: "#48BB7818" },
  partial: { label: "Partial", color: "#D69E2E", bg: "#D69E2E18" },
  overdue: { label: "Overdue", color: "#E53E3E", bg: "#E53E3E18" },
};

export default function AdminFees() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState<typeof FEE_RECORDS[0] | null>(null);
  const [records, setRecords] = useState(FEE_RECORDS);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = records.filter((r) => {
    const ms = search === "" || r.name.toLowerCase().includes(search.toLowerCase()) || r.roll.includes(search);
    const mf = statusFilter === "All" || r.status === statusFilter.toLowerCase();
    return ms && mf;
  });

  const totalCollected = records.reduce((a, r) => a + r.paid, 0);
  const totalDue = records.reduce((a, r) => a + (r.amount - r.paid), 0);
  const totalAmount = records.reduce((a, r) => a + r.amount, 0);

  const markPaid = (id: string) => {
    setRecords((prev) => prev.map((r) => r.id === id ? { ...r, paid: r.amount, status: "paid" } : r));
    setSelected(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Fees</Text>
        <TouchableOpacity
          onPress={() => Haptics.selectionAsync()}
          style={[styles.exportBtn, { backgroundColor: "#9B7BC4" }]}
          activeOpacity={0.85}
        >
          <Ionicons name="download-outline" size={14} color="#FFFFFF" />
          <Text style={styles.exportBtnText}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={[styles.summaryBanner, { backgroundColor: "#9B7BC4" }]}>
        <View style={styles.bannerCol}>
          <Text style={styles.bannerVal}>₹{(totalCollected / 1000).toFixed(0)}k</Text>
          <Text style={styles.bannerLabel}>Collected</Text>
        </View>
        <View style={[styles.bannerDivider, { backgroundColor: "rgba(255,255,255,0.3)" }]} />
        <View style={styles.bannerCol}>
          <Text style={[styles.bannerVal, { color: "#FBBF24" }]}>₹{(totalDue / 1000).toFixed(0)}k</Text>
          <Text style={styles.bannerLabel}>Pending</Text>
        </View>
        <View style={[styles.bannerDivider, { backgroundColor: "rgba(255,255,255,0.3)" }]} />
        <View style={styles.bannerCol}>
          <Text style={styles.bannerVal}>{records.filter((r) => r.status === "paid").length}/{records.length}</Text>
          <Text style={styles.bannerLabel}>Cleared</Text>
        </View>
        <View style={[styles.bannerDivider, { backgroundColor: "rgba(255,255,255,0.3)" }]} />
        <View style={styles.bannerCol}>
          <Text style={[styles.bannerVal, { color: "#FCA5A5" }]}>{records.filter((r) => r.status === "overdue").length}</Text>
          <Text style={styles.bannerLabel}>Overdue</Text>
        </View>
      </View>

      {/* Collection Progress */}
      <View style={[styles.progressSection, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.progressHead}>
          <Text style={[styles.progressLabel, { color: colors.foreground }]}>Collection Progress</Text>
          <Text style={[styles.progressPct, { color: "#9B7BC4" }]}>{Math.round((totalCollected / totalAmount) * 100)}%</Text>
        </View>
        <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
          <View style={[styles.progressFill, { width: `${Math.round((totalCollected / totalAmount) * 100)}%` as any }]} />
        </View>
      </View>

      <View style={[styles.searchWrap, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={15} color={colors.mutedForeground} />
          <TextInput value={search} onChangeText={setSearch} placeholder="Search by name or roll…" placeholderTextColor={colors.mutedForeground} style={[styles.searchInput, { color: colors.foreground }]} />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.chipRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}>
        {STATUS_FILTERS.map((f) => (
          <TouchableOpacity key={f} onPress={() => setStatusFilter(f)} style={[styles.chip, { backgroundColor: statusFilter === f ? "#9B7BC4" : colors.muted, borderColor: statusFilter === f ? "#9B7BC4" : colors.border }]} activeOpacity={0.8}>
            <Text style={[styles.chipText, { color: statusFilter === f ? "#FFFFFF" : colors.mutedForeground }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 110 : 110 }]}>
        {filtered.map((r) => {
          const cfg = STATUS_CONFIG[r.status];
          return (
            <TouchableOpacity
              key={r.id}
              onPress={() => { setSelected(r); Haptics.selectionAsync(); }}
              style={[styles.feeCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: cfg.color, borderLeftWidth: 4 }]}
              activeOpacity={0.85}
            >
              <View style={[styles.feeAvatar, { backgroundColor: r.color }]}>
                <Text style={styles.feeAvatarText}>{r.avatar}</Text>
              </View>
              <View style={styles.feeInfo}>
                <View style={styles.nameRow}>
                  <Text style={[styles.feeName, { color: colors.foreground }]}>{r.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
                <Text style={[styles.feeMeta, { color: colors.mutedForeground }]}>Roll #{r.roll} • {r.class} • Due: {r.dueDate}</Text>
                <View style={styles.amountRow}>
                  <Text style={[styles.paidAmt, { color: "#48BB78" }]}>₹{r.paid.toLocaleString()}</Text>
                  <Text style={[styles.totalAmt, { color: colors.mutedForeground }]}>/ ₹{r.amount.toLocaleString()}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.border} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={!!selected} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            {selected && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.foreground }]}>Fee Details</Text>
                  <TouchableOpacity onPress={() => setSelected(null)}>
                    <Ionicons name="close" size={22} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
                <View style={[styles.modalProfile, { backgroundColor: STATUS_CONFIG[selected.status].bg, borderRadius: 14 }]}>
                  <View style={[styles.bigAvatar, { backgroundColor: selected.color }]}>
                    <Text style={styles.bigAvatarText}>{selected.avatar}</Text>
                  </View>
                  <View>
                    <Text style={[styles.modalName, { color: colors.foreground }]}>{selected.name}</Text>
                    <Text style={[styles.modalMeta, { color: colors.mutedForeground }]}>{selected.class} • Roll #{selected.roll}</Text>
                  </View>
                  <View style={[styles.modalStatusBadge, { backgroundColor: STATUS_CONFIG[selected.status].bg }]}>
                    <Text style={[styles.modalStatusText, { color: STATUS_CONFIG[selected.status].color }]}>
                      {STATUS_CONFIG[selected.status].label}
                    </Text>
                  </View>
                </View>
                {[
                  { label: "Total Fee", val: `₹${selected.amount.toLocaleString()}` },
                  { label: "Amount Paid", val: `₹${selected.paid.toLocaleString()}` },
                  { label: "Balance Due", val: `₹${(selected.amount - selected.paid).toLocaleString()}` },
                  { label: "Due Date", val: selected.dueDate },
                ].map((row) => (
                  <View key={row.label} style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
                    <Text style={[styles.detailVal, { color: colors.foreground }]}>{row.val}</Text>
                  </View>
                ))}
                <View style={styles.modalActions}>
                  {selected.status !== "paid" && (
                    <TouchableOpacity
                      onPress={() => markPaid(selected.id)}
                      style={[styles.actionBtn, { backgroundColor: "#48BB7818", borderColor: "#48BB7830" }]}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="checkmark-circle" size={15} color="#48BB78" />
                      <Text style={[styles.actionBtnText, { color: "#48BB78" }]}>Mark as Paid</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => { setSelected(null); Haptics.selectionAsync(); }}
                    style={[styles.actionBtn, { backgroundColor: "#9B7BC418", borderColor: "#9B7BC430" }]}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="mail-outline" size={15} color="#9B7BC4" />
                    <Text style={[styles.actionBtnText, { color: "#9B7BC4" }]}>Send Reminder</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  title: { flex: 1, fontSize: 20, fontFamily: "Poppins_700Bold" },
  exportBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  exportBtnText: { color: "#FFFFFF", fontSize: 12, fontFamily: "Poppins_700Bold" },
  summaryBanner: { flexDirection: "row", paddingVertical: 14, paddingHorizontal: 8 },
  bannerCol: { flex: 1, alignItems: "center", gap: 2 },
  bannerVal: { color: "#FFFFFF", fontSize: 16, fontFamily: "Poppins_700Bold" },
  bannerLabel: { color: "rgba(255,255,255,0.7)", fontSize: 9, fontFamily: "Poppins_400Regular" },
  bannerDivider: { width: 1, marginVertical: 4 },
  progressSection: { paddingHorizontal: 16, paddingVertical: 10, gap: 6, borderBottomWidth: 1 },
  progressHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressLabel: { fontSize: 12, fontFamily: "Poppins_500Medium" },
  progressPct: { fontSize: 13, fontFamily: "Poppins_700Bold" },
  progressBg: { height: 7, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 7, borderRadius: 4, backgroundColor: "#9B7BC4" },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9 },
  searchInput: { flex: 1, fontSize: 13, fontFamily: "Poppins_400Regular" },
  chipRow: { maxHeight: 52, borderBottomWidth: 1 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  scroll: { padding: 16, gap: 0 },
  feeCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  feeAvatar: { width: 42, height: 42, borderRadius: 21, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  feeAvatarText: { color: "#FFFFFF", fontSize: 13, fontFamily: "Poppins_700Bold" },
  feeInfo: { flex: 1, gap: 3 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  feeName: { flex: 1, fontSize: 13, fontFamily: "Poppins_700Bold" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusText: { fontSize: 9, fontFamily: "Poppins_600SemiBold" },
  feeMeta: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  amountRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  paidAmt: { fontSize: 13, fontFamily: "Poppins_700Bold" },
  totalAmt: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 10 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  modalTitle: { fontSize: 17, fontFamily: "Poppins_700Bold" },
  modalProfile: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, marginBottom: 4 },
  bigAvatar: { width: 46, height: 46, borderRadius: 23, justifyContent: "center", alignItems: "center" },
  bigAvatarText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Poppins_700Bold" },
  modalName: { fontSize: 15, fontFamily: "Poppins_700Bold" },
  modalMeta: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  modalStatusBadge: { marginLeft: "auto", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  modalStatusText: { fontSize: 11, fontFamily: "Poppins_700Bold" },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 9, borderBottomWidth: 1 },
  detailLabel: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  detailVal: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 11, borderRadius: 12, borderWidth: 1 },
  actionBtnText: { fontSize: 12, fontFamily: "Poppins_700Bold" },
});
