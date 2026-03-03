import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Modal,
  Linking,
  ScrollView,
  Image,
} from "react-native";

const STATUS_COLORS = {
  Pending: "#F59E0B",
  "In Progress": "#3B82F6",
  Completed: "#10B981",
};

const initialIssues = [
  {
    id: "1",
    title: "Water leakage in bathroom",
    tenant: "Rahul Sharma",
    tenantPhone: "9876543210",
    supervisor: "Ramesh Kumar",
    supervisorPhone: "9123456780",
    flat: "Flat 302",
    priority: "High",
    status: "Pending",
    date: "Feb 25, 2026",
    description: "Water leaking from ceiling near shower area.",
    images: [
      // require("./assets/images/waterleak-image.png"),
    ],
     ownerComment: "", 
  },
  {
    id: "2",
    title: "AC not working in bedroom",
    tenant: "Sneha Patel",
    tenantPhone: "9988776655",
    supervisor: "Ramesh Kumar",
    supervisorPhone: "9123456780",
    flat: "Flat 105",
    priority: "Medium",
    status: "In Progress",
    date: "Feb 26, 2026",
    description:
      "Bedroom AC is not cooling properly and makes loud noise.",
    images: [
      // require("../assets/images/fan-image.png"),

    ],
  },
];

export default function OwnerIssuesScreen() {
  const [search, setSearch] = useState("");
  const [issues, setIssues] = useState(initialIssues);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
const [ownerComment, setOwnerComment] = useState("");

  const openDetails = (item) => {
    setSelectedIssue(item);
    setModalVisible(true);
  };

  const updateStatus = (status) => {
    setIssues((prev) =>
      prev.map((item) =>
        item.id === selectedIssue.id ? { ...item, status } : item
      )
    );
    setSelectedIssue({ ...selectedIssue, status });
  };

  const filteredIssues = issues.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.pageTitle}>Issues & Complaints</Text>

      {/* SUMMARY */}
      <View style={styles.summaryRow}>
        {["Pending", "In Progress", "Completed"].map((status) => (
          <SummaryCard
            key={status}
            label={status === "Completed" ? "Resolved" : status}
            count={issues.filter((i) => i.status === status).length}
            color={STATUS_COLORS[status]}
          />
        ))}
      </View>

      <Text style={styles.sectionHeader}>Tenant Issues</Text>

      <TextInput
        placeholder="Search issues..."
        style={styles.search}
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredIssues}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => openDetails(item)}>
            <View style={styles.card}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.sub}>
                {item.tenant} • {item.flat}
              </Text>

              <View style={styles.rowBetween}>
                <StatusBadge status={item.status} />
                <Text style={styles.date}>{item.date}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide">
        {selectedIssue && (
          <ScrollView style={styles.modal}>
            <Text style={styles.modalTitle}>
              {selectedIssue.title}
            </Text>

            {/* DETAILS CARD */}
            <View style={styles.detailCard}>
              <Detail label="Tenant" value={selectedIssue.tenant} />
              <Detail label="Flat" value={selectedIssue.flat} />
              <Detail label="Phone" value={selectedIssue.tenantPhone} />
              <Detail label="Supervisor" value={selectedIssue.supervisor} />
              <Detail
                label="Supervisor Phone"
                value={selectedIssue.supervisorPhone}
              />

              <View style={styles.divider} />

              <Detail label="Date" value={selectedIssue.date} />
              <Detail label="Priority" value={selectedIssue.priority} />
            </View>

            {/* DESCRIPTION */}
            <View style={styles.descCard}>
              <Text style={styles.descTitle}>Description</Text>
              <Text style={styles.descText}>
                {selectedIssue.description}
              </Text>
            </View>
            {/* IMAGES */}
{selectedIssue.images.length > 0 && (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={{ marginBottom: 20 }}
  >
    {selectedIssue.images.map((img, index) => (
      <Image
        key={index}
        source={img}
        style={styles.issueImage}
      />
    ))}
  </ScrollView>
)}

            {/* UPDATE STATUS */}
            <View style={styles.detailCard}>
              <Text style={styles.updateTitle}>Update Status</Text>

              <View style={styles.statusRow}>
                {["Pending", "In Progress", "Completed"].map((status) => {
                  const isSelected =
                    selectedIssue.status === status;
                  const color = STATUS_COLORS[status];

                  return (
                    <TouchableOpacity
                      key={status}
                      onPress={() => updateStatus(status)}
                      style={[
                        styles.statusBtn,
                        {
                          borderColor: color,
                          backgroundColor: isSelected
                            ? `${color}15`
                            : "#fff",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color },
                        ]}
                      >
                        {status}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

{/* OWNER COMMENT */}
<View style={styles.detailCard}>
  <Text style={styles.updateTitle}>Owner Comment</Text>

  <TextInput
    placeholder="Write a comment for tenant..."
    multiline
    value={ownerComment}
    onChangeText={setOwnerComment}
    style={styles.commentInput}
  />
</View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                Update
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

/* ---------- COMPONENTS ---------- */

const StatusBadge = ({ status }) => {
  const color = STATUS_COLORS[status];
  return (
    <View style={[styles.statusBadge, { backgroundColor: color }]}>
      <Text style={styles.badgeText}>{status}</Text>
    </View>
  );
};

const Detail = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const SummaryCard = ({ label, count, color }) => (
  <View style={[styles.summaryCard, { borderColor: color }]}>
    <Text style={[styles.summaryCount, { color }]}>{count}</Text>
    <Text style={styles.summaryLabel}>{label}</Text>
  </View>
);

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 16,
  },

  pageTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 16,
    marginTop: 40,
  },

  sectionHeader: {
    fontSize: 20,
    fontWeight: "700",
    marginVertical: 12,
    color: "#111827",
  },

  search: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
    elevation: 4,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  sub: {
    fontSize: 14,
    color: "#6B7280",
    marginVertical: 6,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  date: { fontSize: 13, color: "#9CA3AF" },

  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },

  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  modal: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 20,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 18,
    color: "#111827",
  },

  detailCard: {
    backgroundColor: "#fff",
    padding: 22,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 4,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  label: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },

  value: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 10,
  },

  descCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 3,
  },

  descTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },

  descText: {
    fontSize: 16,
    color: "#4B5563",
    lineHeight: 22,
  },issueImage: {
  width: 260,
  height: 170,
  borderRadius: 20,
  marginRight: 14,
  resizeMode: "cover",
  // backgroundColor:"#ffffff",
},

  updateTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },

  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  statusBtn: {
    flex: 1,
    borderWidth: 1.5,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 4,
  },

  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },commentInput: {
  backgroundColor: "#F3F4F6",
  borderRadius: 16,
  padding: 14,
  minHeight: 90,
  textAlignVertical: "top",
  fontSize: 14,
},

  closeBtn: {
    backgroundColor: "#EF4444",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 10,
    marginBottom:90,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1.5,
  },

  summaryCount: {
    fontSize: 24,
    fontWeight: "800",
  },

  summaryLabel: {
    fontSize: 13,
    marginTop: 6,
    color: "#6B7280",
  },
});