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
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  paid: { label: "Paid", color: "#48BB78", bg: "#48BB7818", icon: "checkmark-circle" },
  partial: { label: "Partial", color: "#D69E2E", bg: "#D69E2E18", icon: "time" },
  overdue: { label: "Overdue", color: "#E53E3E", bg: "#E53E3E18", icon: "warning" },
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
  const collectionPct = Math.round((totalCollected / totalAmount) * 100);

  const markPaid = (id: string) => {
    setRecords((prev) => prev.map((r) => r.id === id ? { ...r, paid: r.amount, status: "paid" } : r));
    setSelected(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── COLORED BANNER ── */}
      <View style={[styles.headerBanner, { paddingTop: topPad + 8, backgroundColor: "#9B7BC4", overflow: "hidden" }]}>
        <View style={[styles.dec1, { backgroundColor: "rgba(255,255,255,0.08)" }]} />
        <View style={[styles.dec2, { backgroundColor: "rgba(255,255,255,0.06)" }]} />
        <View style={styles.bannerTop}>
          <View>
            <Text style={styles.bannerLabel}>ADMIN PANEL</Text>
            <Text style={styles.bannerTitle}>Fee Management</Text>
          </View>
          <TouchableOpacity style={[styles.exportBtn, { backgroundColor: "rgba(255,255,255,0.22)" }]} activeOpacity={0.85} onPress={() => Haptics.selectionAsync()}>
            <Ionicons name="download-outline" size={14} color="#FFFFFF" />
            <Text style={styles.exportBtnText}>Export</Text>
          </TouchableOpacity>
        </View>
        {/* Fee summary strip */}
        <View style={[styles.bannerStrip, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
          {[
            { val: `₹${(totalCollected / 1000).toFixed(0)}k`, label: "Collected", icon: "checkmark-circle" },
            { val: `₹${(totalDue / 1000).toFixed(0)}k`, label: "Pending", icon: "time", highlight: "#FBBF24" },
            { val: `${records.filter((r) => r.status === "paid").length}/${records.length}`, label: "Cleared", icon: "people" },
            { val: `${records.filter((r) => r.status === "overdue").length}`, label: "Overdue", icon: "warning", highlight: "#FCA5A5" },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              <View style={styles.stripStat}>
                <Ionicons name={s.icon as any} size={12} color={s.highlight ?? "rgba(255,255,255,0.8)"} />
                <Text style={[styles.stripVal, { color: s.highlight ?? "#FFFFFF" }]}>{s.val}</Text>
                <Text style={styles.stripLabel}>{s.label}</Text>
              </View>
              {i < 3 && <View style={[styles.stripDiv, { backgroundColor: "rgba(255,255,255,0.2)" }]} />}
            </React.Fragment>
          ))}
        </View>
        <View style={[styles.waveCut, { backgroundColor: colors.background }]} />
      </View>

      {/* Collection progress bar */}
      <View style={[styles.progressSection, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.progressHead}>
          <View style={styles.progressLeft}>
            <View style={[styles.progressIconWrap, { backgroundColor: "#9B7BC418" }]}>
              <Ionicons name="analytics" size={14} color="#9B7BC4" />
            </View>
            <Text style={[styles.progressLabel, { color: colors.foreground }]}>Collection Progress</Text>
          </View>
          <Text style={[styles.progressPct, { color: "#9B7BC4" }]}>{collectionPct}%</Text>
        </View>
        <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
          <View style={[styles.progressFill, { width: `${collectionPct}%` as any }]} />
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={15} color={colors.mutedForeground} />
          <TextInput value={search} onChangeText={setSearch} placeholder="Search by name or roll…" placeholderTextColor={colors.mutedForeground} style={[styles.searchInput, { color: colors.foreground }]} />
          {search.length > 0 && <TouchableOpacity onPress={() => setSearch("")}><Ionicons name="close-circle" size={16} color={colors.mutedForeground} /></TouchableOpacity>}
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.chipRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}>
        {STATUS_FILTERS.map((f) => (
          <TouchableOpacity key={f} onPress={() => setStatusFilter(f)} style={[styles.chip, { backgroundColor: statusFilter === f ? "#9B7BC4" : colors.muted, borderColor: statusFilter === f ? "#9B7BC4" : colors.border }]} activeOpacity={0.8}>
            {f !== "All" && <Ionicons name={STATUS_CONFIG[f.toLowerCase()]?.icon as any ?? "list"} size={11} color={statusFilter === f ? "#FFFFFF" : colors.mutedForeground} />}
            <Text style={[styles.chipText, { color: statusFilter === f ? "#FFFFFF" : colors.mutedForeground }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 110 : 110 }]}>
        {filtered.map((r) => {
          const cfg = STATUS_CONFIG[r.status];
          const paidPct = Math.round((r.paid / r.amount) * 100);
          return (
            <TouchableOpacity
              key={r.id}
              onPress={() => { setSelected(r); Haptics.selectionAsync(); }}
              style={[styles.feeCard, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: "#000" }]}
              activeOpacity={0.85}
            >
              <View style={[styles.cardAccent, { backgroundColor: cfg.color }]} />
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <View style={[styles.avatarRing, { borderColor: r.color + "40" }]}>
                    <View style={[styles.feeAvatar, { backgroundColor: r.color }]}>
                      <Text style={styles.feeAvatarText}>{r.avatar}</Text>
                    </View>
                  </View>
                  <View style={styles.feeInfo}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.feeName, { color: colors.foreground }]}>{r.name}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                        <Ionicons name={cfg.icon as any} size={9} color={cfg.color} />
                        <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                      </View>
                    </View>
                    <Text style={[styles.feeMeta, { color: colors.mutedForeground }]}>Roll #{r.roll} • {r.class} • Due {r.dueDate}</Text>
                    <View style={styles.amountRow}>
                      <Text style={[styles.paidAmt, { color: "#48BB78" }]}>₹{r.paid.toLocaleString()}</Text>
                      <Text style={[styles.totalAmt, { color: colors.mutedForeground }]}>/ ₹{r.amount.toLocaleString()}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.border} />
                </View>
                {/* Mini progress */}
                <View style={[styles.miniProgressBg, { backgroundColor: colors.muted }]}>
                  <View style={[styles.miniProgressFill, { width: `${paidPct}%` as any, backgroundColor: cfg.color }]} />
                </View>
              </View>
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
                <View style={[styles.modalHero, { backgroundColor: STATUS_CONFIG[selected.status].bg }]}>
                  <View style={[styles.bigAvatar, { backgroundColor: selected.color }]}>
                    <Text style={styles.bigAvatarText}>{selected.avatar}</Text>
                  </View>
                  <View style={styles.modalHeroInfo}>
                    <Text style={[styles.modalName, { color: colors.foreground }]}>{selected.name}</Text>
                    <Text style={[styles.modalMeta, { color: colors.mutedForeground }]}>{selected.class} • Roll #{selected.roll}</Text>
                  </View>
                  <View style={[styles.modalStatusBadge, { backgroundColor: STATUS_CONFIG[selected.status].bg }]}>
                    <Ionicons name={STATUS_CONFIG[selected.status].icon as any} size={12} color={STATUS_CONFIG[selected.status].color} />
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
                    <TouchableOpacity onPress={() => markPaid(selected.id)} style={[styles.actionBtn, { backgroundColor: "#48BB7818", borderColor: "#48BB7830" }]} activeOpacity={0.8}>
                      <Ionicons name="checkmark-circle" size={15} color="#48BB78" />
                      <Text style={[styles.actionBtnText, { color: "#48BB78" }]}>Mark Paid</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => { setSelected(null); Haptics.selectionAsync(); }} style={[styles.actionBtn, { backgroundColor: "#9B7BC418", borderColor: "#9B7BC430" }]} activeOpacity={0.8}>
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
  headerBanner: { paddingHorizontal: 16, paddingBottom: 30, position: "relative" },
  dec1: { position: "absolute", width: 220, height: 220, borderRadius: 110, top: -60, right: -50 },
  dec2: { position: "absolute", width: 130, height: 130, borderRadius: 65, bottom: -30, left: -20 },
  bannerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14, zIndex: 1 },
  bannerLabel: { color: "rgba(255,255,255,0.7)", fontSize: 9, fontFamily: "Poppins_700Bold", letterSpacing: 1.2, marginBottom: 2 },
  bannerTitle: { color: "#FFFFFF", fontSize: 22, fontFamily: "Poppins_700Bold" },
  exportBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  exportBtnText: { color: "#FFFFFF", fontSize: 12, fontFamily: "Poppins_700Bold" },
  bannerStrip: { flexDirection: "row", alignItems: "center", borderRadius: 16, padding: 12, zIndex: 1 },
  stripStat: { flex: 1, alignItems: "center", gap: 2 },
  stripVal: { fontSize: 15, fontFamily: "Poppins_700Bold" },
  stripLabel: { color: "rgba(255,255,255,0.7)", fontSize: 9, fontFamily: "Poppins_400Regular" },
  stripDiv: { width: 1, height: 28 },
  waveCut: { position: "absolute", bottom: 0, left: 0, right: 0, height: 14, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  progressSection: { paddingHorizontal: 16, paddingVertical: 12, gap: 8, borderBottomWidth: 1 },
  progressHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  progressIconWrap: { width: 26, height: 26, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  progressLabel: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  progressPct: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  progressBg: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: "#9B7BC4" },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 13, fontFamily: "Poppins_400Regular" },
  chipRow: { maxHeight: 52, borderBottomWidth: 1 },
  chip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  scroll: { paddingHorizontal: 16, paddingTop: 14, gap: 0 },
  feeCard: { borderRadius: 16, borderWidth: 1, marginBottom: 10, overflow: "hidden", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardAccent: { height: 3 },
  cardBody: { padding: 14, gap: 10 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarRing: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  feeAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  feeAvatarText: { color: "#FFFFFF", fontSize: 13, fontFamily: "Poppins_700Bold" },
  feeInfo: { flex: 1, gap: 3 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  feeName: { flex: 1, fontSize: 13, fontFamily: "Poppins_700Bold" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9 },
  statusText: { fontSize: 9, fontFamily: "Poppins_700Bold" },
  feeMeta: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  amountRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  paidAmt: { fontSize: 13, fontFamily: "Poppins_700Bold" },
  totalAmt: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  miniProgressBg: { height: 5, borderRadius: 3, overflow: "hidden" },
  miniProgressFill: { height: 5, borderRadius: 3 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20, gap: 10 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  modalTitle: { fontSize: 17, fontFamily: "Poppins_700Bold" },
  modalHero: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, padding: 14, marginBottom: 4 },
  bigAvatar: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" },
  bigAvatarText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Poppins_700Bold" },
  modalHeroInfo: { flex: 1 },
  modalName: { fontSize: 15, fontFamily: "Poppins_700Bold" },
  modalMeta: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  modalStatusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  modalStatusText: { fontSize: 11, fontFamily: "Poppins_700Bold" },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 9, borderBottomWidth: 1 },
  detailLabel: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  detailVal: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 13, borderWidth: 1 },
  actionBtnText: { fontSize: 12, fontFamily: "Poppins_700Bold" },
});
