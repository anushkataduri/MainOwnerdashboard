import React, { useState } from "react";
import COLORS from "../constants/colors";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as ImagePicker from "expo-image-picker";

export default function OwnerProfile() {
  const initialOwner = {
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

  const [editableOwner, setEditableOwner] = useState(initialOwner);
  const [profileImage, setProfileImage] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [expenses, setExpenses] = useState([]);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const totalExpenses = expenses.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  const netProfit = property.income - totalExpenses;
  const emptyBeds = property.totalBeds - property.occupied;

  /* ================= ADD EXPENSE ================= */

  const addExpense = () => {
    if (!category || !amount) {
      Alert.alert("Please fill all required fields");
      return;
    }

    const now = new Date();

    const newExpense = {
      id: Date.now().toString(),
      category,
      amount,
      description,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      fullDate: now,
    };

    setExpenses([...expenses, newExpense]);
    setCategory("");
    setAmount("");
    setDescription("");
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter((item) => item.id !== id));
  };

  /* ================= PRINT FUNCTION ================= */

  const printMonthlyStatement = async () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyExpenses = expenses.filter(
      (item) =>
        item.fullDate.getMonth() === currentMonth &&
        item.fullDate.getFullYear() === currentYear
    );

    let total = monthlyExpenses.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );

    const html = `
      <h1>Monthly Expense Statement</h1>
      <p>Owner: ${editableOwner.name}</p>
      <hr/>
      ${monthlyExpenses
        .map(
          (item) => `
        <p>
          <strong>${item.category}</strong><br/>
          ${item.description || ""}<br/>
          ${item.date} ${item.time}<br/>
          Amount: ₹${item.amount}
        </p>
        <hr/>
      `
        )
        .join("")}
      <h2>Total: ₹${total}</h2>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };


  /* ================= IMAGE PICKER ================= */

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* HERO SECTION */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>My Profile</Text>

          <TouchableOpacity
            style={styles.profileCard}
            onPress={() => setShowDetailsModal(true)}
          >
            <TouchableOpacity onPress={pickImage}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatar} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarLetter}>
                    {editableOwner.name.charAt(0)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={{ marginLeft: 15 }}>
              <Text style={styles.profileName}>{editableOwner.name}</Text>
              <Text style={styles.profileRole}>{editableOwner.role}</Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={22}
              color={COLORS.TEXT_LIGHT}
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* FINANCIAL DASHBOARD */}
          <Text style={styles.sectionTitle}>Financial Overview</Text>

          <View style={styles.dashboardRow}>
            <StatCard title="Income" value={`₹${property.income}`} />
            <StatCard title="Expenses" value={`₹${totalExpenses}`} />
          </View>

          <View style={styles.profitCard}>
            <Text style={styles.profitLabel}>Net Profit</Text>
            <Text style={styles.profitValue}>₹{netProfit}</Text>
          </View>
          
        {/* ADD EXPENSE */}
        <Text style={styles.sectionTitle}>Add Expense</Text>

        <View style={styles.expenseBox}>

          <TextInput
            placeholder="Category"
            placeholderTextColor={COLORS.TEXT_LIGHT}
            value={category}
            onChangeText={setCategory}
            style={styles.input}
          />

          <TextInput
            placeholder="Amount"
            placeholderTextColor={COLORS.TEXT_LIGHT}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            placeholder="Description (optional)"
            placeholderTextColor={COLORS.TEXT_LIGHT}
            value={description}
            onChangeText={setDescription}
            style={[styles.input, { height: 80, textAlignVertical: "top" }]}
            multiline
          />

          <TouchableOpacity style={styles.addButton} onPress={addExpense}>
            <Text style={styles.addButtonText}>Add Expense</Text>
          </TouchableOpacity>
        </View>

        {/* EXPENSE LIST */}
        {expenses.map((item) => (
          <View key={item.id} style={styles.expenseItem}>
            <Text style={{ fontWeight: "600", color: COLORS.TEXT_PRIMARY }}>
              {item.category}
            </Text>

            {item.description ? (
              <Text style={{ color: COLORS.TEXT_SECONDARY, marginTop: 4 }}>
                {item.description}
              </Text>
            ) : null}

            <Text style={{ color: COLORS.TEXT_LIGHT, fontSize: 12, marginTop: 6 }}>
              {item.date} • {item.time}
            </Text>

            <View style={[styles.rowBetween, { marginTop: 6 }]}>
              <Text style={{ color: COLORS.TEXT_SECONDARY }}>
                ₹{item.amount}
              </Text>

              <TouchableOpacity onPress={() => deleteExpense(item.id)}>
                <Text style={{ color: COLORS.ERROR,marginLeft:300, fontWeight: "600" }}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}


          {/* PROPERTY STATS */}
          <View style={styles.propertyRow}>
            <MiniStat label="Total Beds" value={property.totalBeds} />
            <MiniStat label="Occupied" value={property.occupied} />
            <MiniStat label="Empty" value={emptyBeds} />
          </View>

          {/* ACCOUNT SECTION */}
          <Text style={styles.sectionTitle}>Account</Text>

          {[
            "Transactions",
            "Password & Security",
            "Notifications",
            "Help",
          ].map((item, index) => (
            <TouchableOpacity key={index} style={styles.accountRow}>
              <Text style={styles.accountText}>{item}</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.TEXT_LIGHT}
              />
            </TouchableOpacity>
          ))}
    {/* PRINT BUTTON */}
        <TouchableOpacity
          style={[styles.addButton, { marginTop: 25 }]}
          onPress={printMonthlyStatement}
        >
          <Text style={styles.addButtonText}>Print Monthly Statement</Text>
        </TouchableOpacity>

    

        <View style={{ height: 30 }} />
          <TouchableOpacity style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ================= MODAL PROFILE DETAILS ================= */}

      <Modal visible={showDetailsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profile Details</Text>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <Ionicons name="close" size={24} />
              </TouchableOpacity>
            </View>

            {!isEditing ? (
              <>
                <DetailRow label="Name" value={editableOwner.name} />
                <DetailRow label="Email" value={editableOwner.email} />
                <DetailRow label="Phone" value={editableOwner.phone} />

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => setIsEditing(true)}
                >
                  <Text style={styles.primaryButtonText}>Edit Profile</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TextInput
                  value={editableOwner.name}
                  onChangeText={(text) =>
                    setEditableOwner({ ...editableOwner, name: text })
                  }
                  style={styles.input}
                />
                <TextInput
                  value={editableOwner.email}
                  onChangeText={(text) =>
                    setEditableOwner({ ...editableOwner, email: text })
                  }
                  style={styles.input}
                />
                <TextInput
                  value={editableOwner.phone}
                  onChangeText={(text) =>
                    setEditableOwner({ ...editableOwner, phone: text })
                  }
                  style={styles.input}
                />

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => {
                    setIsEditing(false);
                    Alert.alert("Profile Updated");
                  }}
                >
                  <Text style={styles.primaryButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* COMPONENTS */

const StatCard = ({ title, value }) => (
  <View style={styles.statCard}>
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

const DetailRow = ({ label, value }) => (
  <View style={{ marginBottom: 15 }}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },

  hero: {
    backgroundColor: COLORS.PRIMARY,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 80,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  heroTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.WHITE,
    marginBottom: 20,
  },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.WHITE,
    padding: 18,
    borderRadius: 20,
    elevation: 5,
  },

  avatar: {
    width: 65,
    height: 65,
    borderRadius: 32,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarLetter: {
    color: COLORS.WHITE,
    fontSize: 22,
    fontWeight: "700",
  },

  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
  },

  profileRole: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },

  content: { padding: 20, marginTop: -40 },

  dashboardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  statCard: {
    width: "48%",
    backgroundColor: COLORS.WHITE,
    padding: 18,
    borderRadius: 18,
    elevation: 3,
  },

  statTitle: { fontSize: 12, color: COLORS.TEXT_SECONDARY },

  statValue: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 6,
    color: COLORS.TEXT_PRIMARY,
  },

  profitCard: {
    marginTop: 15,
    backgroundColor: COLORS.PRIMARY,
    padding: 22,
    borderRadius: 20,
  },

  profitLabel: { color: COLORS.WHITE, fontSize: 14 },

  profitValue: {
    color: COLORS.WHITE,
    fontSize: 26,
    fontWeight: "800",
    marginTop: 6,
  },

  propertyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  miniStat: {
    width: "31%",
    backgroundColor: COLORS.WHITE,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },

  miniValue: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.PRIMARY,
  },

  miniLabel: {
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },

  accountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.WHITE,
    padding: 18,
    borderRadius: 16,
    marginBottom: 10,
  },

  accountText: {
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
  },

  logoutButton: {
    marginTop: 30,
    alignItems: "center",
  },

  logoutText: {
    color: COLORS.ERROR,
    fontWeight: "700",
    fontSize: 16,
  },

  /* MODAL */

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  modalCard: {
    backgroundColor: COLORS.WHITE,
    padding: 25,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
  },

  detailLabel: {
    fontSize: 12,
    color: COLORS.TEXT_LIGHT,
  },

  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },

  primaryButton: {
    backgroundColor: COLORS.PRIMARY,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 15,
  },

  primaryButtonText: {
    color: COLORS.WHITE,
    fontWeight: "700",
  },

   input: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: COLORS.WHITE,
    color: COLORS.TEXT_PRIMARY,
  },
   addButton: {
    backgroundColor: COLORS.PRIMARY,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  addButtonText: {
    color: COLORS.WHITE,
    fontWeight: "700",
    fontSize: 15,
  },
  expenseItem: {
    backgroundColor: COLORS.WHITE,
    padding: 14,
    borderRadius: 14,
    marginTop: 12,
  },
   expenseBox: {
    backgroundColor: COLORS.WHITE,
    padding: 18,
    borderRadius: 20,
  },
sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
    marginTop: 28,
  },

});