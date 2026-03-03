import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { PinchGestureHandler, State } from "react-native-gesture-handler";
import { WebView } from "react-native-webview";

const CARD_HEIGHT = 560;

export default function BuildingScreen() {
  const width = Dimensions.get("window").width;
  const SIDEBAR_WIDTH = 64;
  const CONTENT_GAP = 12;
  const CONTAINER_PADDING = 16;
  const availableWidth = Math.max(
    320,
    Math.round(width - SIDEBAR_WIDTH - CONTENT_GAP - CONTAINER_PADDING * 2),
  );
  const baseCardWidth = availableWidth;
  const [sliderWidth, setSliderWidth] = useState(0);
  const SPACING = 12;
  const cardWidth = (sliderWidth || baseCardWidth) - SPACING;
  const sliderRef = useRef(null);
  const sidebarRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [filterMode, setFilterMode] = useState(null);
  const [bedCounts, setBedCounts] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [tenantName, setTenantName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [bedNumber, setBedNumber] = useState(1);
  const [monthlyRent, setMonthlyRent] = useState("");
  const [tenants, setTenants] = useState({});
  const [idProofFile, setIdProofFile] = useState("");
  const [idProofUri, setIdProofUri] = useState("");
  const [idPreviewVisible, setIdPreviewVisible] = useState(false);
  const [idPreviewHtml, setIdPreviewHtml] = useState("");
  const [idOpenUri, setIdOpenUri] = useState("");
  const [previewUri, setPreviewUri] = useState("");
  const [showBottomViewId, setShowBottomViewId] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const onPinchStateChange = (e) => {
    if (e.nativeEvent.state === State.END) {
      const scale = e.nativeEvent.scale ?? 1;
      const next = Math.min(3, Math.max(1, previewScale * scale));
      setPreviewScale(next);
    }
  };
  const [touchedName, setTouchedName] = useState(false);
  const [touchedPhone, setTouchedPhone] = useState(false);
  const [touchedEmail, setTouchedEmail] = useState(false);
  const [touchedRent, setTouchedRent] = useState(false);
  useEffect(() => {
    if (!modalVisible) {
      setIdProofFile("");
      setIdProofUri("");
      setIdPreviewHtml("");
      setIdPreviewVisible(false);
    }
  }, [modalVisible]);
  const makeRooms = (n) =>
    Array.from(
      { length: n === 1 ? 15 : 4 },
      (_, i) => `${n}${String(i + 1).padStart(2, "0")}`,
    );
  const floors = Array.from({ length: 15 }, (_, i) => {
    const floorNumber = i + 1;
    return { floor: `Floor ${floorNumber}`, rooms: makeRooms(floorNumber) };
  });
  const isOccupied = (floorLabel, room) => {
    const key = `${floorLabel}-${room}`;
    const count = bedCounts[key] ?? 0;
    return count > 0;
  };
  const getCount = (floorLabel, room) =>
    bedCounts[`${floorLabel}-${room}`] ?? 0;
  const getTileColor = (floorLabel, room) => {
    const c = getCount(floorLabel, room);
    if (filterMode === "occupied") return c >= 4 ? "#2ECC71" : "#F1C40F";
    if (filterMode === "empty" && c === 0) return "#E74C3C";
    if (filterMode === null && c === 0) return "#C9A0DC";
    if (c === 0) return "#E74C3C";
    if (c >= 4) return "#2ECC71";
    return "#F1C40F";
  };
  const snap = cardWidth + SPACING;
  const handleSelectFloor = (idx) => {
    setActiveIndex(idx);
    sliderRef.current?.scrollTo({
      x: idx * (cardWidth + SPACING),
      animated: true,
    });
  };
  useEffect(() => {
    const SIDE_BUTTON_HEIGHT = 40;
    const SIDE_BUTTON_GAP = 8;
    const offset = Math.max(
      0,
      idxToOffset(activeIndex, SIDE_BUTTON_HEIGHT, SIDE_BUTTON_GAP) - 60,
    );
    sidebarRef.current?.scrollTo({ y: offset, animated: true });
  }, [activeIndex]);
  const idxToOffset = (idx, h, g) => idx * (h + g);
  const totalRooms = floors.reduce((sum, f) => sum + f.rooms.length, 0);
  const occupiedRooms = floors.reduce(
    (sum, f) => sum + f.rooms.filter((r) => isOccupied(f.floor, r)).length,
    0,
  );
  const emptyRooms = totalRooms - occupiedRooms;
  const openTenantModal = (floorLabel, room) => {
    setSelectedFloor(floorLabel);
    setSelectedRoom(room);
    const current = getCount(floorLabel, room);
    setBedNumber(Math.min(4, current + 1));
    setTenantName("");
    setContactNumber("");
    setEmail("");
    setMonthlyRent("");
    setIdProofFile("");
    setIdProofUri("");
    setIdPreviewHtml("");
    setIdPreviewVisible(false);
    setTouchedName(false);
    setTouchedPhone(false);
    setTouchedEmail(false);
    setTouchedRent(false);
    setModalVisible(true);
  };
  const isValidName = (name) => /^[A-Za-z\s]+$/.test(name.trim());
  const isValidPhone = (phone) => /^\d{10,11}$/.test(phone.trim());
  const isValidEmail = (mail) =>
    mail.trim().length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.trim());
  const isFormValid = () => {
    return (
      isValidName(tenantName) &&
      isValidPhone(contactNumber) &&
      monthlyRent.trim().length > 0 &&
      idProofFile.trim().length > 0 &&
      isValidEmail(email) &&
      bedNumber >= 1 &&
      bedNumber <= 4
    );
  };
  const addTenant = () => {
    if (!selectedFloor || !selectedRoom) {
      setModalVisible(false);
      return;
    }
    if (!isFormValid()) {
      return;
    }
    const key = `${selectedFloor}-${selectedRoom}`;
    setTenants((prev) => {
      const list = prev[key] ?? [];
      const nextList = [
        ...list,
        {
          name: tenantName.trim(),
          phone: contactNumber.trim(),
          email: email.trim(),
          bed: bedNumber,
          rent: monthlyRent.trim(),
          idUri: idOpenUri || idProofUri,
        },
      ];
      return { ...prev, [key]: nextList };
    });
    setBedCounts((prev) => {
      const next = Math.min(4, (prev[key] ?? 0) + 1);
      return { ...prev, [key]: next };
    });
    setIdProofFile("");
    setIdProofUri("");
    setIdOpenUri("");
    setIdPreviewVisible(false);
    setShowBottomViewId(false);
    setModalVisible(false);
  };
  const removeTenant = (floorLabel, room, index) => {
    const key = `${floorLabel}-${room}`;
    setTenants((prev) => {
      const list = prev[key] ?? [];
      const nextList = list.filter((_, i) => i !== index);
      return { ...prev, [key]: nextList };
    });
    setBedCounts((prev) => {
      const next = Math.max(0, (prev[key] ?? 0) - 1);
      return { ...prev, [key]: next };
    });
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="always">
      {/* Header */}
      <Text style={styles.header}>Ganesh</Text>
      <Text style={styles.subHeader}>Welcome back, Krishna</Text>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <TouchableOpacity
          style={[
            styles.statBox,
            { backgroundColor: "#C5EBD2" },
            filterMode === "occupied" && styles.statBoxSelected,
          ]}
          activeOpacity={0.8}
          onPress={() => setFilterMode("occupied")}
        >
          <Text style={styles.statNumber}>{occupiedRooms}</Text>
          <Text style={styles.statLabel}>Occupied</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statBox,
            { backgroundColor: "#FFCECE" },
            filterMode === "empty" && styles.statBoxSelected,
          ]}
          activeOpacity={0.8}
          onPress={() => setFilterMode("empty")}
        >
          <Text style={styles.statNumber}>{emptyRooms}</Text>
          <Text style={styles.statLabel}>Empty</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statBox,
            { backgroundColor: "#E0D4FF" },
            filterMode === null && styles.statBoxSelected,
          ]}
          activeOpacity={0.8}
          onPress={() => setFilterMode(null)}
        >
          <Text style={styles.statNumber}>{totalRooms}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Building View</Text>
        <View style={[styles.legendRow, { marginTop: 0 }]}>
          <View style={[styles.legendDot, { backgroundColor: "#2ECC71" }]} />
          <Text style={styles.legendText}>Full</Text>
          <View style={[styles.legendDot, { backgroundColor: "#F1C40F" }]} />
          <Text style={styles.legendText}>Partial</Text>
          <View style={[styles.legendDot, { backgroundColor: "#E74C3C" }]} />
          <Text style={styles.legendText}>Empty</Text>
        </View>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.sidebar}>
          <ScrollView
            ref={sidebarRef}
            style={styles.sidebarScroll}
            contentContainerStyle={styles.sidebarScrollContent}
            showsVerticalScrollIndicator
          >
            {floors.map((f, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.sideButton,
                  activeIndex === idx && styles.sideButtonActive,
                ]}
                onPress={() => handleSelectFloor(idx)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.sideButtonText,
                    activeIndex === idx && styles.sideButtonTextActive,
                  ]}
                >
                  {idx + 1}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView
          ref={sliderRef}
          horizontal
          snapToInterval={snap}
          decelerationRate="fast"
          scrollEventThrottle={8}
          keyboardShouldPersistTaps="always"
          onScroll={(e) => {
            const x = e.nativeEvent.contentOffset.x;
            const idx = Math.max(
              0,
              Math.min(
                floors.length - 1,
                Math.round(x / (cardWidth + SPACING)),
              ),
            );
            setActiveIndex(idx);
          }}
          showsHorizontalScrollIndicator={false}
          style={styles.slider}
          contentContainerStyle={{ paddingHorizontal: SPACING }}
          onMomentumScrollEnd={(e) => {
            const x = e.nativeEvent.contentOffset.x;
            const idx = Math.max(
              0,
              Math.min(
                floors.length - 1,
                Math.round((x - SPACING) / (cardWidth + SPACING)),
              ),
            );
            setActiveIndex(idx);
          }}
        >
          {floors.map((item, index) => (
            <View
              style={[
                styles.card,
                {
                  width: cardWidth,
                  marginRight: index === floors.length - 1 ? 0 : SPACING,
                  height: CARD_HEIGHT,
                },
              ]}
              key={index}
              onLayout={(e) => {
                if (!sliderWidth) {
                  setSliderWidth(e.nativeEvent.layout.width);
                }
              }}
            >
              <Text style={styles.floorTitle}>{item.floor}</Text>
              <ScrollView
                style={styles.cardScroll}
                nestedScrollEnabled
                showsVerticalScrollIndicator
                scrollEventThrottle={8}
              >
                <View style={styles.roomGrid}>
                  {(filterMode === "occupied"
                    ? item.rooms.filter((r) => isOccupied(item.floor, r))
                    : filterMode === "empty"
                      ? item.rooms.filter((r) => getCount(item.floor, r) < 4)
                      : item.rooms
                  ).map((room, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.roomBox,
                        {
                          backgroundColor: getTileColor(item.floor, room),
                        },
                      ]}
                    >
                      {(() => {
                        const tileColor = getTileColor(item.floor, room);
                        const tColor =
                          tileColor === "#2ECC71" || tileColor === "#E74C3C"
                            ? "#FFFFFF"
                            : "#1F2937";
                        return (
                          <>
                            <Text
                              style={[styles.roomNumber, { color: tColor }]}
                            >
                              {room}
                            </Text>
                            <Text style={[styles.roomText, { color: tColor }]}>
                              {getCount(item.floor, room)}/4 beds
                            </Text>
                          </>
                        );
                      })()}
                      <View style={styles.controlsRow}>
                        <TouchableOpacity
                          style={styles.controlBtn}
                          onPress={() => openTenantModal(item.floor, room)}
                        >
                          <Text style={styles.controlText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      </View>
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior="padding" style={{ width: "100%" }}>
            <View style={styles.modalCard}>
              <ScrollView
                style={styles.modalContentScroll}
                contentContainerStyle={{ paddingBottom: 24 }}
                nestedScrollEnabled
                stickyHeaderIndices={[0]}
                keyboardShouldPersistTaps="always"
              >
                <View
                  style={[
                    styles.modalHeaderRow,
                    { backgroundColor: "#FFFFFF", position: "relative" },
                  ]}
                >
                  <Text style={styles.modalTitle}>
                    {selectedRoom ? `Room ${selectedRoom}` : "Room"}
                  </Text>
                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalClose}>×</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.modalStatsRow}>
                  <View style={styles.modalStatBlock}>
                    <Text style={styles.modalStatLabel}>Occupancy</Text>
                    <Text style={styles.modalStatValue}>
                      {getCount(selectedFloor ?? "", selectedRoom ?? "")}/4
                    </Text>
                  </View>
                  <View style={styles.modalStatBlock}>
                    <Text style={styles.modalStatLabel}>Available</Text>
                    <Text style={[styles.modalStatValue, { color: "#2ECC71" }]}>
                      {Math.max(
                        0,
                        4 - getCount(selectedFloor ?? "", selectedRoom ?? ""),
                      )}{" "}
                      beds
                    </Text>
                  </View>
                </View>
                <View style={styles.modalSectionHeader}>
                  <Text style={styles.modalSectionTitle}>Current Tenants</Text>
                </View>
                <View style={styles.currentTenantsBox}>
                  {(tenants[`${selectedFloor}-${selectedRoom}`] ?? []).map(
                    (t, idx) => (
                      <View key={idx} style={styles.tenantRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.tenantName}>{t.name}</Text>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <Text style={styles.tenantMeta}>
                              Bed {t.bed} ·{" "}
                            </Text>
                            <Ionicons
                              name="call-outline"
                              size={14}
                              color="#2ECC71"
                            />
                            <Text
                              style={[styles.tenantMeta, { marginLeft: 4 }]}
                            >
                              {t.phone}
                            </Text>
                            {!!t.rent && (
                              <>
                                <Text style={styles.tenantMeta}> · </Text>
                                <Text
                                  style={[
                                    styles.tenantMeta,
                                    { color: "#0a7ea4" },
                                  ]}
                                >
                                  ₹
                                </Text>
                                <Text
                                  style={[styles.tenantMeta, { marginLeft: 4 }]}
                                >
                                  {t.rent}
                                </Text>
                              </>
                            )}
                          </View>
                        </View>
                        {!!t.idUri && (
                          <TouchableOpacity
                            style={[
                              styles.viewBtn,
                              { width: 60, marginTop: 0, marginRight: 6 },
                            ]}
                            onPress={async () => {
                              setIdPreviewVisible(true);
                              setPreviewUri(t.idUri);
                              setShowBottomViewId(false);
                            }}
                          >
                            <Text style={styles.viewBtnText}>ID</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          onPress={() =>
                            removeTenant(selectedFloor, selectedRoom, idx)
                          }
                        >
                          <Ionicons
                            name="trash-outline"
                            size={20}
                            color="#E74C3C"
                          />
                        </TouchableOpacity>
                      </View>
                    ),
                  )}
                  {(tenants[`${selectedFloor}-${selectedRoom}`] ?? [])
                    .length === 0 && (
                    <Text style={styles.emptyTenants}>No tenants</Text>
                  )}
                </View>
                <View style={styles.modalSectionHeader}>
                  <Text style={styles.modalSectionTitle}>Add New Tenant</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Tenant Name</Text>
                  <TextInput
                    value={tenantName}
                    onChangeText={(t) => {
                      if (/^[A-Za-z\s]*$/.test(t)) {
                        setTenantName(t);
                      }
                    }}
                    onBlur={() => setTouchedName(!isValidName(tenantName))}
                    style={[
                      styles.input,
                      touchedName &&
                        (tenantName.trim().length === 0 ||
                          !/^[A-Za-z\s]+$/.test(tenantName.trim())) &&
                        styles.inputError,
                    ]}
                    placeholder="Tenant Name"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Contact Number</Text>
                  <TextInput
                    value={contactNumber}
                    onChangeText={(t) =>
                      setContactNumber(t.replace(/[^0-9]/g, "").slice(0, 11))
                    }
                    onBlur={() => setTouchedPhone(!isValidPhone(contactNumber))}
                    style={[
                      styles.input,
                      touchedPhone &&
                        !/^\d{10,11}$/.test(contactNumber.trim()) &&
                        styles.inputError,
                    ]}
                    placeholder="Contact Number"
                    keyboardType="phone-pad"
                    maxLength={11}
                    textContentType="telephoneNumber"
                    autoComplete="tel"
                    autoCorrect={false}
                  />
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Email</Text>
                  <TextInput
                    value={email}
                    onChangeText={(t) => setEmail(t.trim())}
                    onBlur={() => setTouchedEmail(!isValidEmail(email))}
                    style={[
                      styles.input,
                      touchedEmail &&
                        email.trim().length > 0 &&
                        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
                        styles.inputError,
                    ]}
                    placeholder="Email (optional)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                    autoCorrect={false}
                  />
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>
                    Upload ID (Aadhaar / PAN)
                  </Text>
                  <TouchableOpacity
                    style={styles.uploadBtn}
                    onPress={async () => {
                      const result = await DocumentPicker.getDocumentAsync({
                        type: ["image/*", "application/pdf"],
                        multiple: false,
                        copyToCacheDirectory: true,
                      });
                      if (result?.assets && result.assets.length > 0) {
                        const file = result.assets[0];
                        setIdProofFile(file.name || "selected-file");
                        setIdProofUri(file.uri || "");
                        setShowBottomViewId(true);
                        if (
                          (file.mimeType || file.name || "")
                            .toLowerCase()
                            .includes("pdf")
                        ) {
                          try {
                            const contentUri =
                              await FileSystem.getContentUriAsync(file.uri);
                            setIdOpenUri(contentUri);
                          } catch {
                            setIdOpenUri(file.uri || "");
                          }
                        } else {
                          setIdOpenUri(file.uri || "");
                        }
                        const lower = (
                          file.mimeType ||
                          file.name ||
                          ""
                        ).toLowerCase();
                        if (
                          lower.includes("pdf") ||
                          (file.uri || "").toLowerCase().endsWith(".pdf")
                        ) {
                          try {
                            const base64 = await FileSystem.readAsStringAsync(
                              file.uri,
                              { encoding: "base64" },
                            );
                            const html = `
                          <!DOCTYPE html>
                          <html><head><meta name="viewport" content="width=device-width, initial-scale=1"/></head>
                          <body style="margin:0;padding:0;background:#F9FAFB;">
                            <embed src="data:application/pdf;base64,${base64}" type="application/pdf" style="width:100%;height:100vh;" />
                          </body></html>`;
                            setIdPreviewHtml(html);
                          } catch (_) {
                            setIdPreviewHtml("");
                          }
                        } else {
                          setIdPreviewHtml("");
                        }
                      } else if (result?.name) {
                        setIdProofFile(result.name);
                        if (result?.uri) setIdProofUri(result.uri);
                        setShowBottomViewId(true);
                        if (
                          (result.name || "").toLowerCase().endsWith(".pdf") &&
                          result.uri
                        ) {
                          try {
                            const contentUri =
                              await FileSystem.getContentUriAsync(result.uri);
                            setIdOpenUri(contentUri);
                          } catch {
                            setIdOpenUri(result.uri);
                          }
                        } else {
                          setIdOpenUri(result.uri || "");
                        }
                        const lower = (result.name || "").toLowerCase();
                        if (lower.endsWith(".pdf") && result.uri) {
                          try {
                            const base64 = await FileSystem.readAsStringAsync(
                              result.uri,
                              { encoding: "base64" },
                            );
                            const html = `
                          <!DOCTYPE html>
                          <html><head><meta name="viewport" content="width=device-width, initial-scale=1"/></head>
                          <body style="margin:0;padding:0;background:#F9FAFB;">
                            <embed src="data:application/pdf;base64,${base64}" type="application/pdf" style="width:100%;height:100vh;" />
                          </body></html>`;
                            setIdPreviewHtml(html);
                          } catch (_) {
                            setIdPreviewHtml("");
                          }
                        } else {
                          setIdPreviewHtml("");
                        }
                      }
                    }}
                  >
                    <Text style={styles.uploadBtnText}>
                      {idProofFile ? idProofFile : "Choose file"}
                    </Text>
                  </TouchableOpacity>
                  {!!idProofUri && showBottomViewId && (
                    <TouchableOpacity
                      style={styles.viewBtn}
                      onPress={async () => {
                        const targetUri = idOpenUri || idProofUri;
                        const lower = (targetUri || "").toLowerCase();
                        if (
                          lower.endsWith(".pdf") ||
                          targetUri.startsWith("content://")
                        ) {
                          try {
                            await Linking.openURL(targetUri);
                          } catch (_) {
                            setIdPreviewVisible(true);
                            setPreviewUri(targetUri);
                          }
                        } else {
                          setIdPreviewVisible(true);
                          setPreviewUri(targetUri);
                        }
                      }}
                    >
                      <Text style={styles.viewBtnText}>View ID</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Select Bed</Text>
                  <View style={styles.bedPickerRow}>
                    {[1, 2, 3, 4].map((b) => (
                      <TouchableOpacity
                        key={b}
                        style={[
                          styles.bedBtn,
                          bedNumber === b && styles.bedBtnActive,
                        ]}
                        onPress={() => setBedNumber(b)}
                      >
                        <Text
                          style={[
                            styles.bedBtnText,
                            bedNumber === b && styles.bedBtnTextActive,
                          ]}
                        >
                          {b}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Monthly Rent</Text>
                  <TextInput
                    value={monthlyRent}
                    onChangeText={(t) =>
                      setMonthlyRent(t.replace(/[^0-9]/g, ""))
                    }
                    onBlur={() =>
                      setTouchedRent(monthlyRent.trim().length === 0)
                    }
                    style={[
                      styles.input,
                      touchedRent &&
                        monthlyRent.trim().length === 0 &&
                        styles.inputError,
                    ]}
                    placeholder="Monthly Rent"
                    keyboardType="numeric"
                    autoCorrect={false}
                    autoComplete="off"
                    textContentType="none"
                    importantForAutofill="no"
                  />
                </View>
                <TouchableOpacity
                  style={[styles.addBtn, !isFormValid() && { opacity: 0.5 }]}
                  onPressIn={addTenant}
                  disabled={!isFormValid()}
                >
                  <Text style={styles.addBtnText}>Add Tenant</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
      <Modal transparent visible={idPreviewVisible} animationType="fade">
        <View style={styles.previewOverlay}>
          <View style={styles.previewCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>ID Preview</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={[styles.zoomBtn, { marginRight: 6 }]}
                  onPress={() => {
                    const next = Math.min(
                      3,
                      Math.round((previewScale + 0.2) * 10) / 10,
                    );
                    setPreviewScale(next);
                  }}
                >
                  <Text style={styles.zoomBtnText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.zoomBtn, { marginRight: 10 }]}
                  onPress={() => {
                    const next = Math.max(
                      1,
                      Math.round((previewScale - 0.2) * 10) / 10,
                    );
                    setPreviewScale(next);
                  }}
                >
                  <Text style={styles.zoomBtnText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIdPreviewVisible(false)}>
                  <Text style={styles.modalClose}>×</Text>
                </TouchableOpacity>
              </View>
            </View>
            <PinchGestureHandler
              onGestureEvent={(e) => {
                const scale = e.nativeEvent.scale ?? 1;
                const next = Math.min(3, Math.max(1, scale));
                setPreviewScale(next);
              }}
              onHandlerStateChange={onPinchStateChange}
            >
              <ScrollView
                style={styles.previewContentClip}
                contentContainerStyle={{ alignItems: "stretch" }}
              >
                {previewUri ? (
                  previewUri.toLowerCase().endsWith(".pdf") ? (
                    Platform.OS === "android" ? (
                      /^https?:/i.test(previewUri) ? (
                        <WebView
                          source={{
                            uri:
                              "https://docs.google.com/gview?embedded=true&url=" +
                              encodeURIComponent(previewUri),
                          }}
                          style={{ width: "100%", height: 360 }}
                          originWhitelist={["*"]}
                        />
                      ) : (
                        <View
                          style={{ alignItems: "center", paddingVertical: 12 }}
                        >
                          <Text style={styles.tenantMeta}>
                            PDF preview not supported here on Android
                          </Text>
                          <TouchableOpacity
                            style={[
                              styles.viewBtn,
                              { marginTop: 8, width: 160 },
                            ]}
                            onPress={async () => {
                              try {
                                await Linking.openURL(previewUri);
                              } catch (_) {}
                            }}
                          >
                            <Text style={styles.viewBtnText}>
                              Open Externally
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )
                    ) : idPreviewHtml ? (
                      <WebView
                        source={{ html: idPreviewHtml }}
                        style={{ width: "100%", height: 360 }}
                        originWhitelist={["*"]}
                      />
                    ) : (
                      <WebView
                        source={{ uri: previewUri }}
                        style={{ width: "100%", height: 360 }}
                        originWhitelist={["*"]}
                      />
                    )
                  ) : (
                    <Image
                      source={{ uri: previewUri }}
                      style={{
                        width: "100%",
                        height: Math.round(360 * previewScale),
                        borderRadius: 12,
                        backgroundColor: "#F9FAFB",
                      }}
                      resizeMode="contain"
                    />
                  )
                ) : (
                  <Text style={styles.tenantMeta}>No preview available</Text>
                )}
              </ScrollView>
            </PinchGestureHandler>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  contentRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  sidebar: {
    width: 64,
    height: CARD_HEIGHT,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    padding: 8,
    alignItems: "center",
    gap: 8,
  },
  sidebarScroll: {
    width: "100%",
  },
  sidebarScrollContent: {
    alignItems: "center",
    gap: 8,
  },
  sideButton: {
    width: "100%",
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
  },
  sideButtonActive: {
    backgroundColor: "#0a7ea4",
  },
  sideButtonText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  sideButtonTextActive: {
    color: "#fff",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  slider: {
    flex: 1,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#eee",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cardScroll: {
    flex: 1,
  },

  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 28,
  },

  subHeader: {
    color: "gray",
    marginBottom: 20,
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  statBox: {
    width: "30%",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  statBoxSelected: {
    borderWidth: 2,
    borderColor: "#0a7ea4",
  },

  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
  },

  statLabel: {
    fontSize: 12,
    color: "gray",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 0,
  },

  floorTitle: {
    marginTop: 8,
    marginBottom: 8,
    fontWeight: "700",
    color: "#222",
    fontSize: 18,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
    marginRight: 12,
  },

  roomGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  roomBox: {
    width: "28%",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },

  roomNumber: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },

  roomText: {
    color: "#fff",
    fontSize: 11,
  },

  plus: {
    color: "#fff",
    fontSize: 16,
    marginTop: 5,
  },
  controlsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  controlBtn: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  controlText: {
    color: "#333",
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-start",
    alignItems: "stretch",
    padding: 0,
  },
  modalCard: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 0,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  modalContentScroll: {
    flex: 1,
  },
  previewCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    position: "relative",
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  previewImage: {
    width: "100%",
    height: 360,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
  },
  previewWebView: {
    width: "100%",
    height: 360,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  previewContentClip: {
    height: 360,
    overflow: "hidden",
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingTop: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  modalClose: {
    fontSize: 24,
  },
  modalCloseBtn: {
    position: "absolute",
    right: 8,
    top: -8,
    padding: 4,
  },
  modalRow: {
    marginBottom: 10,
  },
  modalLabel: {
    fontSize: 12,
    color: "#555",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#F9FAFB",
  },
  inputError: {
    borderColor: "#E74C3C",
  },
  uploadBtn: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#F9FAFB",
    alignItems: "flex-start",
  },
  uploadBtnText: {
    color: "#333",
    fontSize: 14,
  },
  viewBtn: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#0a7ea4",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#E6F7ED",
    alignItems: "center",
    width: 120,
  },
  viewBtnText: {
    color: "#0a7ea4",
    fontWeight: "700",
  },
  bedPickerRow: {
    flexDirection: "row",
    gap: 8,
  },
  bedBtn: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#fff",
  },
  bedBtnActive: {
    backgroundColor: "#0a7ea4",
    borderColor: "#0a7ea4",
  },
  bedBtnText: {
    color: "#333",
    fontWeight: "600",
  },
  bedBtnTextActive: {
    color: "#fff",
  },
  addBtn: {
    marginTop: 12,
    backgroundColor: "#0a7ea4",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  zoomOverlay: {
    position: "absolute",
    right: 8,
    top: 8,
    flexDirection: "row",
    gap: 8,
    zIndex: 1000,
  },
  zoomBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  zoomBtnText: {
    color: "#333",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 20,
  },
  modalStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalStatBlock: {
    gap: 4,
  },
  modalStatLabel: {
    fontSize: 12,
    color: "#555",
  },
  modalStatValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  modalSectionHeader: {
    marginBottom: 8,
    marginTop: 4,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },
  currentTenantsBox: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#F9FAFB",
    marginBottom: 12,
  },
  tenantRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tenantName: {
    fontWeight: "600",
    color: "#111",
  },
  tenantMeta: {
    fontSize: 12,
    color: "#555",
  },
  tenantDelete: {
    fontSize: 16,
    color: "#E74C3C",
    paddingHorizontal: 8,
  },
  emptyTenants: {
    color: "#777",
    fontSize: 12,
  },
});
