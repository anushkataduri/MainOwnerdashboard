import { Feather as Icon } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import COLORS from "../../constants/colors";

const FeeManagement = () => {
  const [selectedMonth, setSelectedMonth] = useState("February 2026");
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [tenantName, setTenantName] = useState("");
  const [amount, setAmount] = useState("");
  const [payments, setPayments] = useState([
    {
      id: "p1",
      tenant: "Amit",
      amount: 1200,
      status: "collected",
      month: "February 2026",
    },
    {
      id: "p2",
      tenant: "Priya",
      amount: 800,
      status: "pending",
      month: "February 2026",
    },
    {
      id: "p3",
      tenant: "Ravi",
      amount: 600,
      status: "pending",
      month: "February 2026",
    },
    {
      id: "p4",
      tenant: "Neha",
      amount: 900,
      status: "collected",
      month: "January 2026",
    },
  ]);
  const [filterMode, setFilterMode] = useState("all");

  const months = [
    "February 2026",
    "January 2026",
    "December 2025",
    "November 2025",
    "October 2025",
  ];

  const monthPaymentsAll = payments.filter((p) => p.month === selectedMonth);
  const monthPayments =
    filterMode === "collected"
      ? monthPaymentsAll.filter((p) => p.status === "collected")
      : filterMode === "pending"
        ? monthPaymentsAll.filter((p) => p.status === "pending")
        : monthPaymentsAll;

  const addPayment = () => {
    const amt = parseFloat(String(amount).replace(/[^0-9.]/g, "")) || 0;
    if (!tenantName.trim() || amt <= 0) return;
    const item = {
      id: String(Date.now()),
      tenant: tenantName.trim(),
      amount: amt,
      status: "pending",
      month: selectedMonth,
    };
    setPayments((prev) => [item, ...prev]);
    setTenantName("");
    setAmount("");
    setAddVisible(false);
  };

  const markCollected = (id) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "collected" } : p)),
    );
  };
  const removePayment = (id) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fee Management</Text>

        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setMonthPickerVisible(true)}
        >
          <Text style={styles.dropdownText}>{selectedMonth}</Text>
          <Icon name="chevron-down" size={16} color={COLORS.WHITE} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setFilterMode("collected")}
          style={{ width: "44%" }}
        >
          <LinearGradient
            colors={[COLORS.INFO, COLORS.INFO]}
            style={styles.card}
          >
            <Text
              style={styles.cardLabel}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              Collected
            </Text>
            <Text
              style={[styles.amount, { color: "#FFFFFF" }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              ₹
              {monthPaymentsAll
                .filter((p) => p.status === "collected")
                .reduce((s, x) => s + x.amount, 0)
                .toLocaleString("en-IN")}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setFilterMode("pending")}
          style={{ width: "44%" }}
        >
          <LinearGradient
            colors={[COLORS.PRIMARY_DARK, COLORS.PRIMARY_LIGHT]}
            style={styles.card}
          >
            <Text
              style={styles.cardLabel}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              Pending
            </Text>
            <Text
              style={[styles.amount, { color: "#FFFFFF" }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              ₹
              {monthPaymentsAll
                .filter((p) => p.status === "pending")
                .reduce((s, x) => s + x.amount, 0)
                .toLocaleString("en-IN")}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionWrapper}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tenant Payments</Text>
        </View>

        <View style={styles.filterRow}>
          {["all", "collected", "pending"].map((x) => (
            <TouchableOpacity
              key={x}
              style={[
                styles.filterBtn,
                filterMode === x && styles.filterBtnActive,
              ]}
              onPress={() => setFilterMode(x)}
            >
              <Text
                style={[
                  styles.filterText,
                  filterMode === x && styles.filterTextActive,
                ]}
              >
                {x[0].toUpperCase() + x.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {monthPayments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Icon name="users" size={32} color="#A0A0A0" />
            <Text style={styles.emptyText}>No tenants yet</Text>
          </View>
        ) : (
          <View style={styles.listCard}>
            <ScrollView style={{ maxHeight: 280 }}>
              {monthPayments.map((p) => (
                <View key={p.id} style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{p.tenant}</Text>
                    <Text style={styles.rowMeta}>₹{p.amount}</Text>
                  </View>
                  <View
                    style={[
                      styles.badge,
                      p.status === "collected"
                        ? {
                            backgroundColor: COLORS.BLUE_LIGHT,
                            borderColor: COLORS.SUCCESS,
                          }
                        : {
                            backgroundColor: COLORS.CARD,
                            borderColor: COLORS.ERROR,
                          },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        p.status === "collected"
                          ? { color: COLORS.SUCCESS }
                          : { color: COLORS.ERROR },
                      ]}
                    >
                      {p.status === "collected" ? "Collected" : "Pending"}
                    </Text>
                  </View>
                  {p.status === "pending" ? (
                    <TouchableOpacity
                      style={[styles.actionBtn, { marginLeft: 8 }]}
                      onPress={() => markCollected(p.id)}
                    >
                      <Text style={styles.actionBtnText}>Mark</Text>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity
                    style={[styles.deleteBtn, { marginLeft: 8 }]}
                    onPress={() => removePayment(p.id)}
                  >
                    <Text style={styles.deleteBtnText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setAddVisible(true)}
            >
              <Text style={styles.addBtnText}>Add Payment</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal transparent visible={monthPickerVisible} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.pickerCard}>
            <Text style={styles.pickerTitle}>Select Month</Text>
            {months.map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.pickerItem,
                  selectedMonth === m && styles.pickerItemActive,
                ]}
                onPress={() => {
                  setSelectedMonth(m);
                  setMonthPickerVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.pickerText,
                    selectedMonth === m && styles.pickerTextActive,
                  ]}
                >
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setMonthPickerVisible(false)}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={addVisible} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.addCard}>
            <Text style={styles.modalTitle}>Add Payment</Text>
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.inputLabel}>Tenant Name</Text>
              <TextInput
                value={tenantName}
                onChangeText={setTenantName}
                style={styles.input}
                placeholder="Enter name"
              />
            </View>
            <View style={{ marginBottom: 14 }}>
              <Text style={styles.inputLabel}>Amount</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                style={styles.input}
                placeholder="₹0"
                keyboardType="numeric"
              />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: COLORS.CARD }]}
                onPress={() => setAddVisible(false)}
              >
                <Text
                  style={[styles.modalBtnText, { color: COLORS.TEXT_PRIMARY }]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: COLORS.PRIMARY }]}
                onPress={addPayment}
              >
                <Text style={[styles.modalBtnText, { color: COLORS.WHITE }]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default FeeManagement;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 26,
    paddingTop: 48,
  },

  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 12,
    marginBottom: 25,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
  },

  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY_DARK,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 12,
  },

  dropdownText: {
    color: COLORS.WHITE,
    fontSize: 13,
    marginRight: 6,
  },

  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    gap: 12,
  },

  card: {
    width: "100%",
    padding: 14,
    borderRadius: 14,
    minHeight: 90,
    justifyContent: "center",
    alignItems: "center",
  },

  cardLabel: {
    fontSize: 13,
    color: COLORS.TEXT_LIGHT,
    marginBottom: 10,
  },

  amount: {
    fontSize: 24,
    fontWeight: "800",
  },

  sectionWrapper: {
    marginTop: 10,
  },

  sectionHeader: {
    backgroundColor: COLORS.PRIMARY_DARK,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },

  sectionTitle: {
    color: COLORS.WHITE,
    fontSize: 15,
    fontWeight: "600",
  },

  emptyCard: {
    backgroundColor: COLORS.BACKGROUND,
    paddingVertical: 50,
    alignItems: "center",
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },

  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.TEXT_LIGHT,
  },

  listCard: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.BACKGROUND,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.WHITE,
  },
  filterBtnActive: {
    backgroundColor: COLORS.BLUE_LIGHT,
    borderColor: COLORS.PRIMARY,
  },
  filterText: {
    fontSize: 12,
    color: COLORS.TEXT_PRIMARY,
  },
  filterTextActive: {
    color: COLORS.PRIMARY,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.DIVIDER,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
  },
  rowMeta: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  badge: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  actionBtn: {
    borderWidth: 1,
    borderColor: "#0a7ea4",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.BLUE_LIGHT,
  },
  actionBtnText: {
    color: COLORS.INFO,
    fontWeight: "600",
  },
  deleteBtn: {
    borderWidth: 1,
    borderColor: COLORS.ERROR,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.WHITE,
  },
  deleteBtnText: {
    color: COLORS.ERROR,
    fontWeight: "700",
    fontSize: 16,
  },
  addBtn: {
    marginTop: 12,
    alignSelf: "flex-end",
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addBtnText: {
    color: COLORS.WHITE,
    fontWeight: "700",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  pickerCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    width: "100%",
    maxWidth: 380,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  pickerItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  pickerItemActive: {
    backgroundColor: COLORS.BLUE_LIGHT,
  },
  pickerText: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
  },
  pickerTextActive: {
    color: COLORS.PRIMARY,
    fontWeight: "700",
  },
  closeBtn: {
    alignSelf: "flex-end",
    marginTop: 10,
    backgroundColor: COLORS.CARD,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeBtnText: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: "600",
  },
  addCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    width: "100%",
    maxWidth: 380,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: COLORS.BACKGROUND,
  },
  modalBtn: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalBtnText: {
    fontWeight: "700",
  },
});
