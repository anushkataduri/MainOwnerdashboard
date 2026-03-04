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
  ScrollView,
  Image,
} from "react-native";
import COLORS from "../../constants/colors";

/* ---------- STATUS COLORS ---------- */

const STATUS_COLORS = {
  Pending: COLORS.WARNING,
  "In Progress": COLORS.INFO,
  Completed: COLORS.SUCCESS,
};

/* ---------- SAMPLE DATA ---------- */

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
    images: [],
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
    images: [],
    ownerComment: "",
  },
];

export default function OwnerIssuesScreen() {
  const [search, setSearch] = useState("");
  const [issues, setIssues] = useState(initialIssues);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [ownerComment, setOwnerComment] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const openDetails = (item) => {
    setSelectedIssue(item);
    setOwnerComment(item.ownerComment || "");
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

  const handleUpdate = () => {
    setIssues((prev) =>
      prev.map((item) =>
        item.id === selectedIssue.id
          ? { ...item, ownerComment }
          : item
      )
    );
    setModalVisible(false);
  };

  /* ---------- FILTER LOGIC ---------- */

  const filteredIssues = issues.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      activeFilter === "All" || item.status === activeFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.pageTitle}>Issues & Complaints</Text>

      {/* SUMMARY FILTER */}
      <View style={styles.summaryRow}>
        {[ "Pending", "In Progress", "Completed"].map(
          (status) => {
            const isActive = activeFilter === status;

            const color =
              status === "All"
                ? COLORS.PRIMARY
                : STATUS_COLORS[status];

            const count =
              status === "All"
                ? issues.length
                : issues.filter((i) => i.status === status)
                    .length;

            return (
              <TouchableOpacity
                key={status}
                style={{ flex: 1 }}
                onPress={() => setActiveFilter(status)}
              >
                <SummaryCard
                  label={
                    status === "Completed"
                      ? "Resolved"
                      : status
                  }
                  count={count}
                  color={color}
                  isActive={isActive}
                />
              </TouchableOpacity>
            );
          }
        )}
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

            <View style={styles.descCard}>
              <Text style={styles.descTitle}>Description</Text>
              <Text style={styles.descText}>
                {selectedIssue.description}
              </Text>
            </View>

            <View style={styles.detailCard}>
              <Text style={styles.updateTitle}>Update Status</Text>
              <View style={styles.statusRow}>
                {["Pending", "In Progress", "Completed"].map(
                  (status) => {
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
                              ? `${color}20`
                              : COLORS.WHITE,
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
                  }
                )}
              </View>
            </View>

            <View style={styles.detailCard}>
              <Text style={styles.updateTitle}>
                Owner Comment
              </Text>

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
              onPress={handleUpdate}
            >
              <Text style={styles.updateBtnText}>
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
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor: `${color}20`,
          borderColor: color,
        },
      ]}
    >
      <Text style={[styles.badgeText, { color }]}>
        {status}
      </Text>
    </View>
  );
};

const Detail = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const SummaryCard = ({
  label,
  count,
  color,
  isActive,
}) => (
  <View
    style={[
      styles.summaryCard,
      {
        borderColor: color,
        backgroundColor: isActive
          ? `${color}25`
          : `${color}10`,
      },
    ]}
  >
    <Text style={[styles.summaryCount, { color }]}>
      {count}
    </Text>
    <Text
      style={[
        styles.summaryLabel,
        { color: isActive ? color : COLORS.TEXT_SECONDARY },
      ]}
    >
      {label}
    </Text>
  </View>
);

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    padding: 16,
  },

  pageTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.PRIMARY,
    marginBottom: 16,
    marginTop: 40,
  },

  sectionHeader: {
    fontSize: 20,
    fontWeight: "700",
    marginVertical: 12,
    color: COLORS.TEXT_PRIMARY,
  },

  search: {
    backgroundColor: COLORS.WHITE,
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },

  card: {
    backgroundColor: COLORS.WHITE,
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
  },

  sub: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginVertical: 6,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  date: {
    fontSize: 13,
    color: COLORS.TEXT_LIGHT,
  },

  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },

  modal: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    padding: 20,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 18,
    color: COLORS.TEXT_PRIMARY,
  },

  detailCard: {
    backgroundColor: COLORS.WHITE,
    padding: 22,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  label: {
    fontSize: 15,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: "500",
  },

  value: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.DIVIDER,
    marginVertical: 10,
  },

  descCard: {
    backgroundColor: COLORS.WHITE,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },

  descTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: COLORS.TEXT_PRIMARY,
  },

  descText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 22,
  },

  updateTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
    color: COLORS.TEXT_PRIMARY,
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
  },

  commentInput: {
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    padding: 14,
    minHeight: 90,
    textAlignVertical: "top",
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },

  closeBtn: {
    backgroundColor: COLORS.PRIMARY,
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 90,
  },

  updateBtnText: {
    color: COLORS.WHITE,
    fontWeight: "600",
    fontSize: 16,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  summaryCard: {
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
    color: COLORS.TEXT_SECONDARY,
  },
});