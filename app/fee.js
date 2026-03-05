import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Alert,
} from "react-native";
import { SwipeListView } from "react-native-swipe-list-view";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import COLORS from "../constants/colors";


const initialData = [
  {
    id: "1",
    name: "Amit",
    status: "Paid",
    amount: 5000,
    method: "Google Pay",
    refId: "GPAY78291",
    date: "12 Feb 2026, 10:42 AM",
  },
  {
    id: "2",
    name: "Priya",
    status: "Pending",
    amount: 800,
    dueDate: "10 Feb 2026",
  },
  {
    id: "3",
    name: "Ravi",
    status: "Late",
    amount: 600,
    dueDate: "05 Feb 2026",
  },
];

export default function OwnerTransactionsScreen() {
  const [data, setData] = useState(initialData);
  const [selected, setSelected] = useState(null);
  const [actionSheet, setActionSheet] = useState(null);

  const markAsPaid = (item) => {
    const updated = data.map((d) =>
      d.id === item.id ? { ...d, status: "Paid" } : d
    );
    setData(updated);
    Alert.alert("Marked as Paid");
  };

  const sendReminder = (item) => {
    Alert.alert("Reminder Sent", `Reminder sent to ${item.name}`);
  };

  const addLateFee = (item) => {
    const updated = data.map((d) =>
      d.id === item.id ? { ...d, amount: d.amount + 100 } : d
    );
    setData(updated);
    Alert.alert("₹100 Late fee added");
  };

  const renderItem = (rowData) => {
    const item = rowData.item;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            borderLeftColor:
              item.status === "Paid"
                ? "#22C55E"
                : item.status === "Late"
                ? "#F97316"
                : "#EF4444",
          },
        ]}
        onPress={() =>
          item.status === "Paid"
            ? setSelected(item)
            : setActionSheet(item)
        }
      >
        <View style={styles.rowBetween}>
          <Text style={styles.name}>{item.name}</Text>
          <Text
            style={[
              styles.amount,
              { color: item.status === "Paid" ? "#22C55E" : "#EF4444" },
            ]}
          >
            {item.status === "Paid"
              ? `+ ₹${item.amount}`
              : `₹${item.amount}`}
          </Text>
        </View>

        <Text style={styles.subText}>
          {item.status === "Paid"
            ? item.date
            : `Due: ${item.dueDate}`}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderHiddenItem = (rowData) => {
    const item = rowData.item;

    return (
      <View style={styles.hiddenRow}>
        {item.status !== "Paid" && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#22C55E" }]}
            onPress={() => markAsPaid(item)}
          >
            <Feather name="check" size={20} color="#fff" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#3B82F6" }]}
          onPress={() =>
            item.status === "Paid"
              ? setSelected(item)
              : sendReminder(item)
          }
        >
          <Feather
            name={item.status === "Paid" ? "file-text" : "bell"}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>

        {item.status === "Late" && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#F97316" }]}
            onPress={() => addLateFee(item)}
          >
            <Feather name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Monthly Rent Transactions</Text>
{/* Summary Cards */}
<View style={styles.summaryRow}>
  <LinearGradient
    colors={["#2563EB", "#1D4ED8"]}
    style={styles.summaryCard}
  >
    <Text style={styles.summaryLabel}>Collected</Text>
    <Text style={styles.summaryAmount}>
      ₹
      {data
        .filter((x) => x.status === "Paid")
        .reduce((s, x) => s + x.amount, 0)
        .toLocaleString("en-IN")}
    </Text>
  </LinearGradient>

  <LinearGradient
    colors={["#7C3AED", "#5B21B6"]}
    style={styles.summaryCard}
  >
    <Text style={styles.summaryLabel}>Pending</Text>
    <Text style={styles.summaryAmount}>
      ₹
      {data
        .filter((x) => x.status !== "Paid")
        .reduce((s, x) => s + x.amount, 0)
        .toLocaleString("en-IN")}
    </Text>
  </LinearGradient>
</View>

{/* Tenant Payments Header */}
<View style={styles.sectionHeader}>
  <Text style={styles.sectionTitle}>Tenant Payments</Text>
</View>
      <SwipeListView
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderHiddenItem={renderHiddenItem}
        rightOpenValue={-180}
      />

      {/* Receipt Modal */}
      <Modal visible={!!selected} animationType="slide">
        <SafeAreaView style={styles.modal}>
          <Feather
            name="x"
            size={24}
            style={{ alignSelf: "flex-end" }}
            onPress={() => setSelected(null)}
          />
          {selected && (
            <View>
              <Text style={styles.modalTitle}>
                Transaction Receipt
              </Text>
              <Text>Tenant: {selected.name}</Text>
              <Text>Amount: ₹{selected.amount}</Text>
              <Text>Method: {selected.method}</Text>
              <Text>Ref ID: {selected.refId}</Text>
              <Text>Date: {selected.date}</Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* Bottom Action Sheet */}
      <Modal visible={!!actionSheet} transparent animationType="slide">
        <View style={styles.sheetContainer}>
          <View style={styles.sheet}>
            {actionSheet && (
              <>
                <Text style={styles.modalTitle}>
                  {actionSheet.name}
                </Text>

                <TouchableOpacity
                  style={styles.sheetBtn}
                  onPress={() => {
                    markAsPaid(actionSheet);
                    setActionSheet(null);
                  }}
                >
                  <Text>Mark as Received</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sheetBtn}
                  onPress={() => {
                    sendReminder(actionSheet);
                    setActionSheet(null);
                  }}
                >
                  <Text>Send Reminder</Text>
                </TouchableOpacity>

                {actionSheet.status === "Late" && (
                  <TouchableOpacity
                    style={styles.sheetBtn}
                    onPress={() => {
                      addLateFee(actionSheet);
                      setActionSheet(null);
                    }}
                  >
                    <Text>Add Late Fee</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => setActionSheet(null)}
                >
                  <Text style={{ color: "red", marginTop: 10 }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  title: { fontSize: 26, fontWeight: "800",    color: COLORS.Black,
   marginTop: 40,marginBottom:25 },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginVertical: 8,
    borderLeftWidth: 6,
    elevation: 3,
  },

  name: { fontSize: 16, fontWeight: "bold" },
  amount: { fontSize: 16, fontWeight: "bold" },
  subText: { color: "#6B7280", marginTop: 4 },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  hiddenRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginVertical: 8,
  },

  actionBtn: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
    borderRadius: 12,
  },

  modal: { flex: 1, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },

  sheetContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  sheet: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  sheetBtn: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  summaryRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 20,
},

summaryCard: {
  width: "48%",
  padding: 18,
  borderRadius: 14,
},

summaryLabel: {
  color: "#E5E7EB",
  fontSize: 13,
},

summaryAmount: {
  color: "#fff",
  fontSize: 22,
  fontWeight: "bold",
  marginTop: 6,
},

sectionHeader: {
  backgroundColor: "#502492",
  paddingVertical: 12,
  paddingHorizontal: 14,
  borderTopLeftRadius: 14,
  borderTopRightRadius: 14,
  
},

sectionTitle: {
  color: "#fff",
  fontSize: 15,
  fontWeight: "600",
},
});