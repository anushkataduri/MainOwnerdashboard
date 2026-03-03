import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function OwnerProfile() {
  const owner = {
    name: "Vishwa",
    role: "Hostel Owner",
    email: "vishwa@gmail.com",
    phone: "9381965301",
  };

  const property = {
    totalBeds: 96,
    occupied: 72,
    income: 10000,
  };

  const [expenses, setExpenses] = useState([]);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");

  const totalExpenses = expenses.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  const netProfit = property.income - totalExpenses;
  const emptyBeds = property.totalBeds - property.occupied;

//   const occupancyPercent = Math.round(
//     (property.occupied / property.totalBeds) * 100
//   );

  const addExpense = () => {
    if (!category || !amount) {
      Alert.alert("Please fill all fields");
      return;
    }

    const newExpense = {
      id: Date.now().toString(),
      category,
      amount,
    };

    setExpenses([...expenses, newExpense]);
    setCategory("");
    setAmount("");
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter((item) => item.id !== id));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.welcome}>My Profile</Text>

      {/* PROFILE CARD */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarLetter}>
            {owner.name.charAt(0)}
          </Text>
        </View>

        <View style={{ marginLeft: 15 }}>
          <Text style={styles.profileName}>{owner.name}</Text>
          <Text style={styles.profileSub}>{owner.role}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={14} color="#555" />
            <Text style={styles.smallText}>{owner.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={14} color="#555" />
            <Text style={styles.smallText}>{owner.phone}</Text>
          </View>
        </View>
      </View>

      {/* FINANCIAL */}
      <Text style={styles.sectionTitle}>Financial Overview</Text>

      <View style={styles.rowBetween}>
        <StatBox title="Total Income" value={`₹${property.income}`} />
        <StatBox title="Total Expenses" value={`₹${totalExpenses}`} />
      </View>

      <View style={styles.bigStat}>
        <Text style={styles.bigStatLabel}>Net Profit</Text>
        <Text style={styles.bigStatValue}>₹{netProfit}</Text>
      </View>

      {/* ADD EXPENSE */}
      <Text style={styles.sectionTitle}>Add Expense</Text>

      <View style={styles.expenseBox}>
        <TextInput
          placeholder="Category (Food, EB Bill...)"
          value={category}
          onChangeText={setCategory}
          style={styles.input}
        />

        <TextInput
          placeholder="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          style={styles.input}
        />

        <TouchableOpacity style={styles.addButton} onPress={addExpense}>
          <Text style={styles.addButtonText}>Add Expense</Text>
        </TouchableOpacity>
      </View>

      {expenses.map((item) => (
        <View key={item.id} style={styles.expenseItem}>
          <Text style={{ fontWeight: "600" }}>{item.category}</Text>
          <View style={styles.rowBetween}>
            <Text>₹{item.amount}</Text>
            <TouchableOpacity onPress={() => deleteExpense(item.id)}>
              <Text style={{ color: "red" }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* PROPERTY STATS */}
      <View style={styles.rowBetween}>
        <MiniStat label="Total Beds" value={property.totalBeds} />
        <MiniStat label="Occupied" value={property.occupied} />
        <MiniStat label="Empty" value={emptyBeds} />
      </View>

      {/* OCCUPANCY */}
      {/* <Text style={styles.sectionTitle}>Occupancy</Text>

      <View style={styles.progressBackground}>
        <View
          style={[styles.progressFill, { width: `${occupancyPercent}%` }]}
        />
      </View>
      <Text style={styles.percentText}>{occupancyPercent}% Occupied</Text> */}

      {/* ✅ ACCOUNT SECTION (UPDATED ONLY THIS PART) */}
      <Text style={styles.accountTitle}>Account</Text>

      {[
        "Personal Details",
        "Transactions",
         "Password & Security",
        "Notifications",
        // "Privacy & Sharing",
        // "Language",
        // "Theme",
        "About Us",
        "Help",
      ].map((item, index) => (
        <TouchableOpacity key={index} style={styles.accountRow}>
          <Text style={styles.accountText}>{item}</Text>
          <Ionicons name="chevron-forward" size={20} color="#A1A1AA" />
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

const StatBox = ({ title, value }) => (
  <View style={styles.statBox}>
    <Text style={styles.statTitle}>{title}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const MiniStat = ({ label, value }) => (
  <View style={styles.miniStat}>
    <Text style={styles.miniValue}>{value}</Text>
    <Text style={styles.miniLabel}>{label}</Text>
  </View>
);

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },

  welcome: {
    fontSize: 34,
    color: "#000",
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 10,
  },

  profileCard: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    marginBottom: 25,
  },

  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarLetter: { color: "#fff", fontSize: 22, fontWeight: "700" },

  profileName: { fontSize: 18, fontWeight: "600" },
  profileSub: { fontSize: 13, color: "#777", marginBottom: 8 },

  infoRow: { flexDirection: "row", alignItems: "center", gap: 6 },

  smallText: { fontSize: 12, color: "#555" },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
    marginBottom: 10,
    marginTop: 20,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statBox: {
    backgroundColor: "#F3F4F6",
    padding: 16,
    borderRadius: 14,
    width: "48%",
  },

  statTitle: { fontSize: 12, color: "#666" },
  statValue: { fontSize: 18, fontWeight: "700", marginTop: 4 },

  bigStat: {
    backgroundColor: "#F3F4F6",
    padding: 18,
    borderRadius: 14,
    marginTop: 12,
  },

  bigStatLabel: { fontSize: 13, color: "#666" },
  bigStatValue: { fontSize: 20, fontWeight: "700", marginTop: 5 },

  expenseBox: {
    backgroundColor: "#F3F4F6",
    padding: 15,
    borderRadius: 14,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },

  addButton: {
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  addButtonText: { color: "#fff", fontWeight: "600" },

  expenseItem: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },

  miniStat: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 14,
    width: "31%",
    alignItems: "center",
    marginTop: 12,
  },

  miniValue: { fontSize: 16, fontWeight: "700" },
  miniLabel: { fontSize: 11, color: "#777" },

  progressBackground: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
  },

  progressFill: {
    height: 8,
    backgroundColor: "#111",
    borderRadius: 6,
  },

  percentText: { fontSize: 12, marginTop: 6, color: "#666" },

  /* ✅ ACCOUNT SECTION NEW STYLES */
  accountTitle: {
    fontSize: 16,
    color: "#9CA3AF",
    fontWeight: "600",
    marginTop: 25,
    marginBottom: 5,
  },

  accountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  accountText: {
    fontSize: 17,
    color: "#111",
    fontWeight: "400",
  },

  logoutButton: {
    marginTop: 25,
    alignItems: "center",
  },

  logoutText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
    
  },
});