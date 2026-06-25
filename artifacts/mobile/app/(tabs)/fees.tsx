import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Platform, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { turso } from "../../lib/turso";
import { useAuth } from "../../context/AuthContext";

interface FeeRecord {
  id: string;
  totalAmount: number;
  paidAmount: number;
  paymentPlan: string;
  nextDueDate: string;
  status: string;
  createdAt: string;
}

export default function StudentFees() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const topPad = Platform.OS === "web" ? 50 : insets.top;

  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalFees, setTotalFees] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalPending, setTotalPending] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchFees = async () => {
      try {
        const res = await turso.execute({
          sql: "SELECT id, totalAmount, paidAmount, paymentPlan, nextDueDate, status, createdAt FROM fees WHERE studentId = ? ORDER BY createdAt DESC",
          args: [user.id]
        });

        let feesTotal = 0;
        let paidTotal = 0;
        let pendingTotal = 0;

        const records: FeeRecord[] = res.rows.map(row => {
          const amt = (row[1] as number) || 0;
          const paid = (row[2] as number) || 0;
          const stat = (row[5] as string) || "pending";

          feesTotal += amt;
          paidTotal += paid;
          if (stat !== "completed") {
            pendingTotal += (amt - paid);
          }

          return {
            id: row[0] as string,
            totalAmount: amt,
            paidAmount: paid,
            paymentPlan: (row[3] as string) || "N/A",
            nextDueDate: (row[4] as string) || "",
            status: stat,
            createdAt: (row[6] as string) || ""
          };
        });

        setFeeRecords(records);
        setTotalFees(feesTotal);
        setTotalPaid(paidTotal);
        setTotalPending(pendingTotal);
      } catch (e) {
        console.error("Error fetching fees:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchFees();
  }, [user]);

  const getStatusColor = (status: string) => {
    if (status === "completed" || status === "paid") return "#10B981";
    if (status === "overdue") return "#EF4444";
    return "#F59E0B";
  };

  const getStatusIcon = (status: string): string => {
    if (status === "completed" || status === "paid") return "checkmark-circle";
    if (status === "overdue") return "alert-circle";
    return "time";
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return dateStr.split("T")[0];
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#0EA5E9" />
        <Text style={{ fontFamily: "Poppins_500Medium", color: "#64748B", marginTop: 12 }}>Loading fee details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient colors={["#0EA5E9", "#2563EB"]} style={[styles.header, { paddingTop: Math.max(topPad, 40) + 30 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Fees</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* KPI SUMMARY CARDS */}
        <View style={styles.kpiSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
            {[
              { title: "Total Fees", val: `₹${totalFees}`, icon: "cash", color: "#3B82F6", bg: "#EFF6FF" },
              { title: "Paid", val: `₹${totalPaid}`, icon: "checkmark-circle", color: "#10B981", bg: "#ECFDF5" },
              { title: "Pending", val: `₹${totalPending}`, icon: "time", color: "#EF4444", bg: "#FEF2F2" },
            ].map((k, i) => (
              <Animated.View key={k.title} entering={FadeInRight.delay(100 + i * 100).springify()} style={[styles.kpiCard, { borderTopColor: k.color, borderTopWidth: 4 }]}>
                <View style={[styles.kpiIconWrap, { backgroundColor: k.bg }]}>
                  <Ionicons name={k.icon as any} size={22} color={k.color} />
                </View>
                <Text style={styles.kpiVal}>{k.val}</Text>
                <Text style={styles.kpiTitle}>{k.title}</Text>
              </Animated.View>
            ))}
          </ScrollView>
        </View>

        {/* OVERDUE ALERT */}
        {feeRecords.some(f => f.status === "overdue") && (
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.alertBox}>
            <Ionicons name="warning" size={24} color="#EF4444" />
            <Text style={styles.alertText}>You have overdue fees! Please clear your dues immediately to avoid late fees or account suspension.</Text>
          </Animated.View>
        )}

        {/* FEE RECORDS LIST */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Fee Records</Text>
            <Text style={styles.countBadge}>{feeRecords.length} total</Text>
          </View>

          {feeRecords.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="receipt-outline" size={40} color="#0EA5E9" />
              </View>
              <Text style={styles.emptyTitle}>No Fee Records</Text>
              <Text style={styles.emptyHint}>Your fee records will appear here once assigned by the admin.</Text>
            </View>
          ) : (
            feeRecords.map((fee, index) => {
              const statusColor = getStatusColor(fee.status);
              const unpaid = fee.totalAmount - fee.paidAmount;
              return (
                <Animated.View key={fee.id} entering={FadeInDown.delay(350 + index * 80).springify()}>
                  <View style={styles.feeCard}>
                    <View style={[styles.feeStripe, { backgroundColor: statusColor }]} />
                    <View style={styles.feeBody}>
                      {/* Top Row: Amount & Status */}
                      <View style={styles.feeTopRow}>
                        <View>
                          <Text style={styles.feeAmount}>₹{fee.totalAmount}</Text>
                          <Text style={styles.feePlan}>{fee.paymentPlan}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor + "15" }]}>
                          <Ionicons name={getStatusIcon(fee.status) as any} size={14} color={statusColor} />
                          <Text style={[styles.statusText, { color: statusColor }]}>
                            {fee.status ? fee.status.toUpperCase() : "PENDING"}
                          </Text>
                        </View>
                      </View>

                      {/* Detail Rows */}
                      <View style={styles.feeDetails}>
                        <View style={styles.feeDetailRow}>
                          <Text style={styles.feeDetailLabel}>Paid</Text>
                          <Text style={[styles.feeDetailVal, { color: "#10B981" }]}>₹{fee.paidAmount}</Text>
                        </View>
                        <View style={styles.feeDetailRow}>
                          <Text style={styles.feeDetailLabel}>Unpaid</Text>
                          <Text style={[styles.feeDetailVal, { color: unpaid > 0 ? "#EF4444" : "#10B981" }]}>₹{unpaid}</Text>
                        </View>
                        <View style={[styles.feeDetailRow, { borderBottomWidth: 0 }]}>
                          <Text style={styles.feeDetailLabel}>Next Due</Text>
                          <Text style={[styles.feeDetailVal, fee.status === "overdue" && { color: "#EF4444" }]}>
                            {formatDate(fee.nextDueDate)}
                          </Text>
                        </View>
                      </View>

                      {/* Progress Bar */}
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBg}>
                          <View style={[styles.progressFill, { width: `${fee.totalAmount > 0 ? Math.min((fee.paidAmount / fee.totalAmount) * 100, 100) : 0}%`, backgroundColor: statusColor }]} />
                        </View>
                        <Text style={styles.progressText}>{fee.totalAmount > 0 ? Math.round((fee.paidAmount / fee.totalAmount) * 100) : 0}% paid</Text>
                      </View>
                    </View>
                  </View>
                </Animated.View>
              );
            })
          )}
        </Animated.View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" }, 
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomLeftRadius: 36, borderBottomRightRadius: 36, position: "relative", overflow: "hidden", zIndex: 10 },
  decoCircle1: { position: "absolute", top: -50, right: -20, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,255,255,0.15)" },
  decoCircle2: { position: "absolute", bottom: -40, left: -40, width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.1)" },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 20, fontFamily: "Poppins_700Bold", color: "#FFFFFF" },

  scroll: { paddingBottom: 100, paddingTop: 24 },

  /* KPI Cards */
  kpiSection: { marginBottom: 24 },
  kpiScroll: { paddingHorizontal: 20, gap: 12 },
  kpiCard: { width: 130, backgroundColor: "#FFFFFF", padding: 16, borderRadius: 20, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3, alignItems: "center", gap: 8 },
  kpiIconWrap: { width: 42, height: 42, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  kpiVal: { fontSize: 20, fontFamily: "Poppins_700Bold", color: "#0F172A" },
  kpiTitle: { fontSize: 11, fontFamily: "Poppins_500Medium", color: "#64748B" },

  /* Alert */
  alertBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#FEF2F2", padding: 16, borderRadius: 16, marginHorizontal: 20, marginBottom: 20, gap: 12, borderWidth: 1, borderColor: "#FEE2E2" },
  alertText: { flex: 1, fontSize: 13, fontFamily: "Poppins_500Medium", color: "#B91C1C", lineHeight: 20 },

  /* Section */
  section: { paddingHorizontal: 20 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", color: "#0F172A", letterSpacing: -0.5 },
  countBadge: { fontSize: 12, fontFamily: "Poppins_600SemiBold", color: "#64748B", backgroundColor: "#F1F5F9", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },

  /* Empty */
  emptyCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 40, alignItems: "center", gap: 14, borderWidth: 1, borderColor: "#F1F5F9" },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center" },
  emptyTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", color: "#0F172A" },
  emptyHint: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "#64748B", textAlign: "center", lineHeight: 20 },

  /* Fee Card */
  feeCard: { backgroundColor: "#FFFFFF", borderRadius: 22, overflow: "hidden", marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2, borderWidth: 1, borderColor: "#F1F5F9" },
  feeStripe: { height: 4 },
  feeBody: { padding: 18, gap: 14 },
  feeTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  feeAmount: { fontSize: 24, fontFamily: "Poppins_700Bold", color: "#0F172A" },
  feePlan: { fontSize: 12, fontFamily: "Poppins_500Medium", color: "#64748B", marginTop: 2 },

  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  statusText: { fontSize: 11, fontFamily: "Poppins_700Bold" },

  feeDetails: { backgroundColor: "#F8FAFC", borderRadius: 14, overflow: "hidden" },
  feeDetailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  feeDetailLabel: { fontSize: 13, fontFamily: "Poppins_500Medium", color: "#64748B" },
  feeDetailVal: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#0F172A" },

  progressContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
  progressBg: { flex: 1, height: 8, backgroundColor: "#F1F5F9", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  progressText: { fontSize: 11, fontFamily: "Poppins_600SemiBold", color: "#64748B", minWidth: 55, textAlign: "right" },
});

