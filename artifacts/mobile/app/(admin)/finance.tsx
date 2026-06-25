import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";

import { turso } from "../../lib/turso";
import DropdownSelector from "../../components/DropdownSelector";
import DateTimePicker from "../../components/DateTimePicker";
import { broadcastFeeReminder } from "../../lib/notifications";

interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  paidAmount: number;
  paymentPlan: string;
  dueDate: string;
  status: string;
}

export default function FinancePage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [fees, setFees] = React.useState<FeeRecord[]>([]);
  const [totalRevenue, setTotalRevenue] = React.useState(0);
  const [pendingDues, setPendingDues] = React.useState(0);
  const [totalPaid, setTotalPaid] = React.useState(0);
  const [totalUnpaid, setTotalUnpaid] = React.useState(0);

  // Form State
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [studentsList, setStudentsList] = React.useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = React.useState("");
  const [feeAmount, setFeeAmount] = React.useState("");
  const [paidAmount, setPaidAmount] = React.useState("0");
  const [feeType, setFeeType] = React.useState("Monthly");
  const [nextDueDate, setNextDueDate] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const calculateDefaultDueDate = (type: string) => {
    const now = new Date();
    if (type === "Monthly") {
      now.setMonth(now.getMonth() + 1);
    } else if (type === "One-Time") {
      now.setMonth(now.getMonth() + 6);
    } else {
      now.setFullYear(now.getFullYear() + 1);
    }
    return now;
  };

  const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleFeeTypeChange = (type: string) => {
    setFeeType(type);
    const nextDate = calculateDefaultDueDate(type);
    setNextDueDate(formatDate(nextDate));
  };

  // Auto-fetch existing fee due date when a student is selected
  const handleStudentSelect = async (studentId: string) => {
    setSelectedStudentId(studentId);
    try {
      const res = await turso.execute({
        sql: "SELECT nextDueDate, totalAmount, paymentPlan, paidAmount FROM fees WHERE studentId = ? ORDER BY createdAt DESC LIMIT 1",
        args: [studentId]
      });
      if (res.rows.length > 0) {
        const existingDate = res.rows[0][0] as string;
        const existingAmount = res.rows[0][1] as number;
        const existingPlan = res.rows[0][2] as string;
        const existingPaid = res.rows[0][3] as number;
        if (existingDate) {
          setNextDueDate(existingDate.split("T")[0]);
        }
        if (existingAmount !== undefined && existingAmount !== null) {
          setFeeAmount(String(existingAmount));
        }
        if (existingPaid !== undefined && existingPaid !== null) {
          setPaidAmount(String(existingPaid));
        } else {
          setPaidAmount("0");
        }
        if (existingPlan) {
          setFeeType(existingPlan);
        }
      } else {
        setFeeAmount("");
        setPaidAmount("0");
        setFeeType("Monthly");
        setNextDueDate(formatDate(calculateDefaultDueDate("Monthly")));
      }
    } catch (e) {
      console.error("Error fetching student fee info:", e);
    }
  };

  const fetchFinance = async () => {
    try {
      const res = await turso.execute(`
        SELECT f.id, f.studentId, u.name, f.totalAmount, f.paymentPlan, f.nextDueDate, f.status, f.paidAmount 
        FROM fees f 
        JOIN users u ON f.studentId = u.id 
        ORDER BY f.createdAt DESC
      `);
      
      let totalFees = 0;
      let paid = 0;
      let unpaid = 0;
      
      const data = res.rows.map(r => {
        const amt = (r[3] as number) || 0;
        const stat = r[6] as string;
        const paidAmt = (r[7] as number) || 0;
        
        totalFees += amt;
        paid += paidAmt;
        unpaid += (amt - paidAmt);
        
        return {
          id: r[0] as string,
          studentId: r[1] as string,
          studentName: r[2] as string,
          amount: amt,
          paidAmount: paidAmt,
          paymentPlan: r[4] as string,
          dueDate: r[5] ? (r[5] as string).split("T")[0] : "N/A",
          status: stat
        };
      });
      
      setTotalRevenue(totalFees); // Reusing state, but this is actually Total Fees
      setPendingDues(unpaid); // Pending Dues is the unpaid amount
      setTotalPaid(paid);
      setTotalUnpaid(unpaid);
      setFees(data);
    } catch (e) {
      console.error("Error fetching finance records:", e);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await turso.execute("SELECT id, name FROM users WHERE role = 'student' ORDER BY name ASC");
      const list = res.rows.map(r => ({ id: r[0] as string, label: r[1] as string }));
      setStudentsList(list);
    } catch (e) {
      console.error("Error fetching students:", e);
    }
  };

  React.useEffect(() => {
    fetchFinance();
    fetchStudents();
    setNextDueDate(formatDate(calculateDefaultDueDate("Monthly")));
  }, []);

  const handleBroadcast = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await broadcastFeeReminder();
      alert("Broadcast reminder sent successfully to all students!");
    } catch (err) {
      console.error(err);
      alert("Failed to send broadcast reminder.");
    }
  };

  const handleAddPayment = async () => {
    if (!selectedStudentId || !feeAmount) {
      alert("Please select a student and enter the total amount.");
      return;
    }

    try {
      setSubmitting(true);
      const feeId = "FEE" + Math.floor(Math.random() * 10000);
      const now = new Date().toISOString();
      const amtTotal = parseInt(feeAmount) || 0;
      const amtPaid = parseInt(paidAmount) || 0;
      const computedStatus = amtPaid >= amtTotal && amtTotal > 0 ? "completed" : "pending";

      const existingRes = await turso.execute({
        sql: "SELECT id FROM fees WHERE studentId = ?",
        args: [selectedStudentId]
      });

      if (existingRes.rows.length > 0) {
        const existingId = existingRes.rows[0][0] as string;
        await turso.execute({
          sql: `
            UPDATE fees 
            SET totalAmount = ?, paymentPlan = ?, paidAmount = ?, nextDueDate = ?, status = ?
            WHERE id = ?
          `,
          args: [
            amtTotal,
            feeType,
            amtPaid,
            nextDueDate || formatDate(new Date()),
            computedStatus,
            existingId
          ]
        });
      } else {
        await turso.execute({
          sql: `
            INSERT INTO fees (id, studentId, totalAmount, paymentPlan, paidAmount, nextDueDate, status, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            feeId,
            selectedStudentId,
            amtTotal,
            feeType,
            amtPaid,
            nextDueDate || formatDate(new Date()),
            computedStatus,
            now
          ]
        });
      }

      // Insert parent notifications
      try {
        const studentInfo = studentsList.find(s => s.id === selectedStudentId);
        const studentName = studentInfo ? studentInfo.label : "Student";
        
        const userRes = await turso.execute({
          sql: "SELECT parentId FROM users WHERE id = ?",
          args: [selectedStudentId]
        });
        
        if (userRes.rows.length > 0 && userRes.rows[0][0]) {
          const parentId = userRes.rows[0][0] as string;
          const notifId = "NOTIF" + Math.floor(Math.random() * 10000);
          
          await turso.execute({
            sql: "INSERT INTO notifications (id, userId, title, message, read, createdAt) VALUES (?, ?, ?, ?, 0, ?)",
            args: [
              notifId, 
              parentId, 
              "New Fee Due", 
              `A fee of ₹${amtTotal} is scheduled for ${studentName}. Due date: ${nextDueDate}.`,
              now
            ]
          });
        }
      } catch (notifErr) {
        console.error("Failed to insert notification:", notifErr);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      alert("Payment recorded successfully!");

      // Reset form
      setShowAddForm(false);
      setSelectedStudentId("");
      setFeeAmount("");
      setPaidAmount("0");
      setFeeType("Monthly");
      setNextDueDate(formatDate(calculateDefaultDueDate("Monthly")));

      // Refresh list
      fetchFinance();
    } catch (e) {
      console.error("Error inserting payment record:", e);
      alert("Failed to record payment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================
  // ADD FORM VIEW
  // ==========================
  if (showAddForm) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: "#F4F6F8" }}>
        <LinearGradient colors={["#0EA5E9", "#2563EB"]} style={[styles.header, { paddingTop: Math.max(insets.top, 40) + 30 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => setShowAddForm(false)} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Record Payment</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.formCard}>
            
            <DropdownSelector
              label="Select Student *"
              placeholder="Search and select student..."
              options={studentsList}
              selectedValue={selectedStudentId}
              onSelect={handleStudentSelect}
              icon="person"
            />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Payment Plan *</Text>
              <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
                {["Monthly", "One-Time"].map(type => (
                  <TouchableOpacity 
                    key={type}
                    style={[styles.typeBtn, feeType === type && styles.typeBtnActive]} 
                    onPress={() => handleFeeTypeChange(type)}
                  >
                    <Text style={[styles.typeBtnText, feeType === type && styles.typeBtnTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Total Payment (₹) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 5000"
                placeholderTextColor="#9CA3AF"
                value={feeAmount}
                onChangeText={setFeeAmount}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Paid Fees (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 2000"
                placeholderTextColor="#9CA3AF"
                value={paidAmount}
                onChangeText={setPaidAmount}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Outstanding Fees (₹)</Text>
              <View style={[styles.input, { backgroundColor: "#F8FAFC", borderColor: "#E2E8F0", justifyContent: "center" }]}>
                <Text style={{ fontSize: 16, fontFamily: "Poppins_700Bold", color: (parseInt(feeAmount)||0) - (parseInt(paidAmount)||0) > 0 ? "#EF4444" : "#10B981" }}>
                  {Math.max(0, (parseInt(feeAmount)||0) - (parseInt(paidAmount)||0))}
                </Text>
              </View>
              <Text style={styles.hintText}>Automatically calculated based on Total and Paid fees.</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Payment Status</Text>
              <View style={[styles.pendingBadge, (parseInt(paidAmount)||0) >= (parseInt(feeAmount)||0) && (parseInt(feeAmount)||0) > 0 && { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" }]}>
                <Ionicons name={(parseInt(paidAmount)||0) >= (parseInt(feeAmount)||0) && (parseInt(feeAmount)||0) > 0 ? "checkmark-circle" : "time-outline"} size={16} color={(parseInt(paidAmount)||0) >= (parseInt(feeAmount)||0) && (parseInt(feeAmount)||0) > 0 ? "#10B981" : "#EF4444"} />
                <Text style={[styles.pendingBadgeText, (parseInt(paidAmount)||0) >= (parseInt(feeAmount)||0) && (parseInt(feeAmount)||0) > 0 && { color: "#10B981" }]}>
                  {(parseInt(paidAmount)||0) >= (parseInt(feeAmount)||0) && (parseInt(feeAmount)||0) > 0 ? "Completed" : "Pending"}
                </Text>
              </View>
              <Text style={styles.hintText}>Status automatically updates based on paid amount vs total amount.</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Due Date / Next Due Date *</Text>
              <DateTimePicker
                value={nextDueDate}
                onChange={setNextDueDate}
                mode="date"
                placeholder="Select Due Date"
              />
              <Text style={styles.hintText}>The next scheduled payment request date.</Text>
            </View>

            <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.7 }]} onPress={handleAddPayment} disabled={submitting}>
              {submitting ? (
                <Text style={styles.submitText}>Recording...</Text>
              ) : (
                <Text style={styles.submitText}>Save Payment Record</Text>
              )}
            </TouchableOpacity>
            
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ==========================
  // LIST VIEW
  // ==========================
  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <LinearGradient colors={["#0EA5E9", "#2563EB"]} style={[styles.header, { paddingTop: Math.max(insets.top, 40) + 30 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Finance & Revenue</Text>
          <TouchableOpacity onPress={handleBroadcast} style={styles.backBtn}>
            <Ionicons name="megaphone" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* FLOATING SEARCH */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput style={styles.searchInput} placeholder="Search transactions or students..." placeholderTextColor="#94A3B8" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* KPI SCROLL */}
        <View style={styles.kpiSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
            {[
              { title: "Total Fees", val: `₹${totalRevenue}`, icon: "cash", color: "#3B82F6", bg: "#EFF6FF", trend: "All Records" },
              { title: "Paid", val: `₹${totalPaid}`, icon: "checkmark-circle", color: "#10B981", bg: "#ECFDF5", trend: "Collected" },
              { title: "Unpaid", val: `₹${totalUnpaid}`, icon: "alert-circle", color: "#EF4444", bg: "#FEF2F2", trend: "Remaining" },
              { title: "Pending Dues", val: `₹${pendingDues}`, icon: "warning", color: "#F59E0B", bg: "#FFFBEB", trend: "Needs Follow-up" },
            ].map((k, i) => (
              <Animated.View key={k.title} entering={FadeInRight.delay(100 + i * 100).springify()} style={[styles.kpiCard, { borderTopColor: k.color, borderTopWidth: 4 }]}>
                <View style={styles.kpiTop}>
                  <View style={[styles.kpiIconWrap, { backgroundColor: k.bg }]}>
                    <Ionicons name={k.icon as any} size={22} color={k.color} />
                  </View>
                </View>
                <Text style={styles.kpiVal}>{k.val}</Text>
                <Text style={styles.kpiTitle}>{k.title}</Text>
                <Text style={styles.kpiTrend}>{k.trend}</Text>
              </Animated.View>
            ))}
          </ScrollView>
        </View>

        {/* ACTIONS */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <TouchableOpacity style={styles.mainActionBtn} onPress={() => { Haptics.selectionAsync(); setShowAddForm(true); }}>
            <LinearGradient colors={["#10B981", "#059669"]} style={styles.mainActionGrad} start={{x:0, y:0}} end={{x:1, y:0}}>
              <Ionicons name="add-circle" size={24} color="#FFF" />
              <Text style={styles.mainActionText}>Record New Payment</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* TRANSACTIONS */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity><Text style={styles.seeAll}>History</Text></TouchableOpacity>
          </View>
          <View style={styles.cardBlock}>
            {fees.length === 0 && (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text style={{ fontFamily: "Poppins_500Medium", color: "#94A3B8" }}>No records found.</Text>
              </View>
            )}
            {fees.map((f, i) => {
              const isPending = f.status !== "completed";
              const c = isPending ? "#EF4444" : "#10B981";
              const unpaidAmt = f.amount - f.paidAmount;
              return (
              <View key={f.id} style={[styles.listItem, i === fees.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={[styles.listIcon, { backgroundColor: c + "15" }]}>
                  <Ionicons name={isPending ? "warning" : "checkmark-circle"} size={20} color={c} />
                </View>
                <View style={styles.listTextWrap}>
                  <Text style={styles.listTitle}>{f.studentName}</Text>
                  <Text style={styles.listDesc}>Due: {f.dueDate} • {f.paymentPlan}</Text>
                  {unpaidAmt > 0 && <Text style={{ fontSize: 11, fontFamily: "Poppins_500Medium", color: "#EF4444", marginTop: 2 }}>Unpaid: ₹{unpaidAmt}</Text>}
                </View>
                <View style={styles.listRight}>
                  <Text style={styles.amountText}>₹{f.amount}</Text>
                  <Text style={[styles.statusText, { color: c }]}>{f.status ? f.status.toUpperCase() : "PENDING"}</Text>
                </View>
              </View>
              )
            })}
          </View>
        </Animated.View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" }, 
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomLeftRadius: 36, borderBottomRightRadius: 36, position: "relative", overflow: "hidden" },
  decoCircle1: { position: "absolute", top: -50, right: -20, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,255,255,0.15)" },
  decoCircle2: { position: "absolute", bottom: -40, left: -40, width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.1)" },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, zIndex: 2 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 20, fontFamily: "Poppins_700Bold", color: "#FFFFFF" },
  
  searchContainer: { marginTop: -12, paddingHorizontal: 20, zIndex: 10 },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, gap: 10, shadowColor: "#0EA5E9", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 5 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Poppins_400Regular", color: "#0F172A", padding: 0 },

  scroll: { paddingBottom: 100 },
  
  kpiSection: { marginTop: 24, marginBottom: 24 },
  kpiScroll: { paddingHorizontal: 20, gap: 14 },
  kpiCard: { width: 160, backgroundColor: "#FFFFFF", padding: 16, borderRadius: 20, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  kpiTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  kpiIconWrap: { width: 42, height: 42, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  kpiVal: { fontSize: 24, fontFamily: "Poppins_700Bold", color: "#0F172A", marginBottom: 2 },
  kpiTitle: { fontSize: 12, fontFamily: "Poppins_500Medium", color: "#64748B", marginBottom: 4 },
  kpiTrend: { fontSize: 10, fontFamily: "Poppins_500Medium", color: "#94A3B8" },

  section: { paddingHorizontal: 20, marginBottom: 30 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", color: "#0F172A", letterSpacing: -0.5 },
  seeAll: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#0EA5E9" },

  mainActionBtn: { shadowColor: "#10B981", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4 },
  mainActionGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, borderRadius: 16, gap: 8 },
  mainActionText: { color: "#FFF", fontSize: 16, fontFamily: "Poppins_600SemiBold" },

  cardBlock: { backgroundColor: "#FFFFFF", borderRadius: 24, paddingHorizontal: 18, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 14 },
  listIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  listTextWrap: { flex: 1 },
  listTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#0F172A", marginBottom: 2 },
  listDesc: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "#64748B" },
  listRight: { alignItems: "flex-end" },
  amountText: { fontSize: 16, fontFamily: "Poppins_700Bold", color: "#0F172A" },
  statusText: { fontSize: 11, fontFamily: "Poppins_600SemiBold", marginTop: 2 },

  /* Form styling */
  formScroll: { padding: 20, paddingBottom: 60 },
  formCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 24, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  inputGroup: { marginBottom: 20, gap: 8 },
  label: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#334155", marginLeft: 4 },
  input: { backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, fontFamily: "Poppins_400Regular", color: "#0F172A" },
  typeBtn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1, borderColor: "#E2E8F0", backgroundColor: "#F8FAFC", alignItems: "center", justifyContent: "center", minWidth: 80 },
  typeBtnActive: { borderColor: "#3B82F6", backgroundColor: "#EFF6FF" },
  typeBtnActiveSuccess: { borderColor: "#10B981", backgroundColor: "#ECFDF5" },
  typeBtnActivePending: { borderColor: "#EF4444", backgroundColor: "#FEF2F2" },
  typeBtnText: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#64748B" },
  typeBtnTextActive: { color: "#1E293B" },
  submitBtn: { backgroundColor: "#2563EB", borderRadius: 16, paddingVertical: 16, alignItems: "center", justifyContent: "center", marginTop: 10, shadowColor: "#2563EB", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  submitText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Poppins_700Bold" },
  hintText: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "#94A3B8", marginLeft: 4 },
  pendingBadge: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FEF2F2", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1, borderColor: "#FECACA" },
  pendingBadgeText: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#EF4444" },
});





