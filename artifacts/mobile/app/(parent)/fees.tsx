import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/context/AuthContext";
import { turso } from "@/lib/turso";

export default function ParentFees() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const topPad = Platform.OS === "web" ? 50 : insets.top;

  const [fees, setFees] = useState<any[]>([]);
  const [totalDue, setTotalDue] = useState(0);

  useEffect(() => {
    if (!user) return;
    
    const fetchFees = async () => {
      try {
        let targetStudentId = "s1";
        const childRes = await turso.execute({
          sql: "SELECT id FROM users WHERE parentId = ?",
          args: [user.id]
        });
        if (childRes.rows.length > 0) {
          targetStudentId = childRes.rows[0][0] as string;
        }

        const feeRes = await turso.execute({
          sql: "SELECT id, totalAmount, paymentPlan, paidAmount, nextDueDate, status FROM fees WHERE studentId = ?",
          args: [targetStudentId]
        });

        let due = 0;
        const data = feeRes.rows.map(r => {
          const tAmount = r[1] as number;
          const pAmount = r[3] as number;
          const status = r[5] as string;
          if (status !== 'completed') due += (tAmount - pAmount);

          return {
            id: r[0] as string,
            totalAmount: tAmount,
            paymentPlan: r[2] as string,
            paidAmount: pAmount,
            nextDueDate: r[4] as string,
            status: status
          };
        });

        setFees(data);
        setTotalDue(due);
      } catch (e) {
        console.error(e);
      }
    };

    fetchFees();
  }, [user]);

  const handlePay = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    alert("Payment Gateway Integration Pending");
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#F59E0B", "#D97706"]} style={[styles.header, { paddingTop: topPad + 10 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />
        
        <Text style={styles.headerTitle}>Fee Portal</Text>
        <Text style={styles.headerSub}>Manage your child's tuition fees</Text>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Outstanding Due</Text>
          <Text style={styles.totalAmount}>₹{totalDue.toLocaleString()}</Text>
          {totalDue > 0 && (
            <TouchableOpacity onPress={handlePay} style={styles.payBtn}>
              <Text style={styles.payBtnText}>Pay Full Amount</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFF" />
            </TouchableOpacity>
          )}
        </Animated.View>

        <Text style={styles.sectionTitle}>Fee Breakdown</Text>
        
        {fees.length > 0 ? (
          fees.map((fee, i) => (
            <Animated.View key={fee.id} entering={FadeInDown.delay(150 + i*50).springify()} style={styles.feeCard}>
              <View style={styles.feeTop}>
                <Text style={styles.feePlan}>{fee.paymentPlan} Plan</Text>
                <View style={[styles.badge, { backgroundColor: fee.status === 'completed' ? '#D1FAE5' : fee.status === 'overdue' ? '#FEE2E2' : '#FEF3C7' }]}>
                  <Text style={[styles.badgeText, { color: fee.status === 'completed' ? '#059669' : fee.status === 'overdue' ? '#DC2626' : '#D97706' }]}>
                    {fee.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.feeDetails}>
                <View style={styles.feeCol}>
                  <Text style={styles.feeLabel}>Total Amount</Text>
                  <Text style={styles.feeVal}>₹{fee.totalAmount}</Text>
                </View>
                <View style={styles.feeCol}>
                  <Text style={styles.feeLabel}>Paid</Text>
                  <Text style={styles.feeVal}>₹{fee.paidAmount}</Text>
                </View>
                <View style={styles.feeCol}>
                  <Text style={styles.feeLabel}>Due Date</Text>
                  <Text style={[styles.feeVal, { color: fee.status === 'overdue' ? '#DC2626' : '#1E293B' }]}>
                    {fee.status === 'completed' ? 'Paid' : new Date(fee.nextDueDate).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {fee.status !== 'completed' && (
                <View style={styles.feeAction}>
                  <View style={styles.dueAmount}>
                    <Text style={styles.dueLabel}>Amount Due:</Text>
                    <Text style={styles.dueVal}>₹{fee.totalAmount - fee.paidAmount}</Text>
                  </View>
                  <TouchableOpacity onPress={handlePay} style={styles.payInstallmentBtn}>
                    <Text style={styles.payBtnText}>Pay</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          ))
        ) : (
          <View style={styles.emptyBox}>
            <Ionicons name="checkmark-circle" size={40} color="#10B981" />
            <Text style={styles.emptyText}>No pending fees.</Text>
          </View>
        )}
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  decoCircle1: { position: "absolute", top: -50, right: -50, width: 150, height: 150, borderRadius: 75, backgroundColor: "rgba(255,255,255,0.15)" },
  decoCircle2: { position: "absolute", bottom: -30, left: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(255,255,255,0.1)" },
  headerTitle: { fontFamily: "Poppins_700Bold", fontSize: 24, color: "#FFF" },
  headerSub: { fontFamily: "Poppins_400Regular", fontSize: 14, color: "rgba(255,255,255,0.9)" },
  
  scroll: { padding: 20 },
  
  totalCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4,
    marginTop: 10
  },
  totalLabel: { fontFamily: "Poppins_500Medium", fontSize: 14, color: "#64748B" },
  totalAmount: { fontFamily: "Poppins_700Bold", fontSize: 36, color: "#1E293B", marginVertical: 8 },
  payBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#10B981", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, gap: 8 },
  payBtnText: { fontFamily: "Poppins_600SemiBold", fontSize: 15, color: "#FFF" },

  sectionTitle: { fontFamily: "Poppins_700Bold", fontSize: 18, color: "#1E293B", marginBottom: 16 },

  feeCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },
  feeTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  feePlan: { fontFamily: "Poppins_600SemiBold", fontSize: 16, color: "#1E293B" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontFamily: "Poppins_600SemiBold", fontSize: 12 },

  feeDetails: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16, backgroundColor: "#F8FAFC", padding: 12, borderRadius: 12 },
  feeCol: { flex: 1 },
  feeLabel: { fontFamily: "Poppins_500Medium", fontSize: 11, color: "#64748B" },
  feeVal: { fontFamily: "Poppins_600SemiBold", fontSize: 14, color: "#1E293B" },

  feeAction: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 16 },
  dueAmount: { flex: 1 },
  dueLabel: { fontFamily: "Poppins_500Medium", fontSize: 12, color: "#64748B" },
  dueVal: { fontFamily: "Poppins_700Bold", fontSize: 18, color: "#F59E0B" },
  payInstallmentBtn: { backgroundColor: "#F59E0B", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  
  emptyBox: { alignItems: "center", padding: 40 },
  emptyText: { fontFamily: "Poppins_500Medium", fontSize: 15, color: "#94A3B8", marginTop: 12 }
});
