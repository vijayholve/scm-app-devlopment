import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import PropTypes from "prop-types";

import { useSCDData } from "../../context/SCDProvider";
import { userDetails } from "../../utils/apiService";

/*
  Usage (inside a Formik render):
  <SCDSelector formik={{ values, setFieldValue, touched, errors }} />

  This is a React Native replacement for the web MUI Autocomplete-based selector.
  It uses simple modals + FlatList so there are no new 3rd-party deps required.
*/

const PickerModal = ({
  visible,
  onClose,
  options,
  labelKey = "name",
  onSelect,
  selectedId,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <FlatList
            data={options}
            keyExtractor={(item, idx) => String(item?.id ?? item?.value ?? idx)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    String(item?.id) === String(selectedId) &&
                      styles.optionSelected,
                  ]}
                >
                  {item?.[labelKey] ?? String(item)}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyRow}>
                <Text style={styles.emptyText}>No options</Text>
              </View>
            )}
          />
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const SCDSelector = ({
  formik,
  showSchool = true,
  showClass = true,
  showDivision = true,
}) => {
  const { values, setFieldValue, touched = {}, errors = {} } = formik || {};
  const {
    schools = [],
    classes = [],
    divisions = [],
    loading,
  } = useSCDData() || {};

  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const u = await userDetails.getUser();
        if (mounted) setCurrentUser(u);
      } catch (err) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const isTeacher = String(currentUser?.type || "").toUpperCase() === "TEACHER";
  const teacherSchoolId = currentUser?.schoolId ?? null;
  const teacherAllocatedClasses = useMemo(
    () => currentUser?.allocatedClasses || [],
    [currentUser]
  );

  // When a teacher, enforce school value
  useEffect(() => {
    if (
      isTeacher &&
      teacherSchoolId != null &&
      values?.schoolId !== teacherSchoolId
    ) {
      setFieldValue("schoolId", teacherSchoolId);
      setFieldValue("classId", "");
      setFieldValue("divisionId", "");
    }
  }, [isTeacher, teacherSchoolId]);

  const currentSchoolId = isTeacher ? teacherSchoolId : values?.schoolId;

  const filteredClasses = useMemo(() => {
    if (!Array.isArray(classes)) return [];
    if (isTeacher && teacherAllocatedClasses.length > 0) {
      const allocatedClassIds = teacherAllocatedClasses.map((ac) => ac.classId);
      return classes.filter((c) =>
        allocatedClassIds.includes(c?.id ?? c?.schoolClassId ?? c?.classId)
      );
    }
    return classes.filter((c) => {
      const schoolKey =
        c.schoolbranchId ??
        c.schoolBranchId ??
        c.schoolId ??
        c.branchId ??
        null;
      return currentSchoolId
        ? String(schoolKey) === String(currentSchoolId)
        : true;
    });
  }, [classes, currentSchoolId, isTeacher, teacherAllocatedClasses]);

  const filteredDivisions = useMemo(() => {
    if (!Array.isArray(divisions)) return [];
    if (isTeacher && teacherAllocatedClasses.length > 0) {
      const allocatedDivisionIds = teacherAllocatedClasses.map(
        (ac) => ac.divisionId
      );
      return divisions.filter((d) =>
        allocatedDivisionIds.includes(d?.id ?? d?.divisionId)
      );
    }
    if (currentSchoolId) {
      return divisions.filter((d) => {
        const schoolKey =
          d?.schoolId ?? d?.schoolBranchId ?? d?.schoolbranchId ?? null;
        return schoolKey ? String(schoolKey) === String(currentSchoolId) : true;
      });
    }
    return divisions;
  }, [divisions, currentSchoolId, isTeacher, teacherAllocatedClasses]);

  // Modal state
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showDivisionModal, setShowDivisionModal] = useState(false);

  if (!formik || typeof setFieldValue !== "function") {
    console.error(
      "SCDSelector requires a formik prop with setFieldValue and values"
    );
    return null;
  }

  const schoolValue =
    (schools || []).find((s) => String(s.id) === String(values?.schoolId)) ||
    null;
  const classValue =
    (filteredClasses || []).find(
      (c) =>
        String(c?.id ?? c?.schoolClassId ?? c?.classId) ===
        String(values?.classId)
    ) || null;
  const divisionValue =
    (filteredDivisions || []).find(
      (d) => String(d?.id ?? d?.divisionId) === String(values?.divisionId)
    ) || null;

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator />
        </View>
      )}

      {!isTeacher && showSchool && (
        <View style={styles.fieldRow}>
          <Text style={styles.label}>School</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowSchoolModal(true)}
          >
            <Text style={styles.inputText}>
              {schoolValue?.name ?? "Select school"}
            </Text>
          </TouchableOpacity>
          {touched?.schoolId && errors?.schoolId && (
            <Text style={styles.errorText}>{errors.schoolId}</Text>
          )}
        </View>
      )}

      {showClass && (
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Class</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowClassModal(true)}
          >
            <Text style={styles.inputText}>
              {classValue?.name ?? "Select class"}
            </Text>
          </TouchableOpacity>
          {touched?.classId && errors?.classId && (
            <Text style={styles.errorText}>{errors.classId}</Text>
          )}
        </View>
      )}

      {showDivision && (
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Division</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDivisionModal(true)}
            disabled={
              loading || (!isTeacher && !values?.schoolId && !values?.classId)
            }
          >
            <Text style={styles.inputText}>
              {divisionValue?.name ?? "Select division"}
            </Text>
          </TouchableOpacity>
          {touched?.divisionId && errors?.divisionId && (
            <Text style={styles.errorText}>{errors.divisionId}</Text>
          )}
        </View>
      )}

      {/* Modals */}
      <PickerModal
        visible={showSchoolModal}
        onClose={() => setShowSchoolModal(false)}
        options={schools}
        onSelect={(item) => {
          const id = item?.id ?? item?.schoolbranchId ?? item?.schoolId ?? null;
          setFieldValue("schoolId", id);
          setFieldValue("classId", "");
          setFieldValue("divisionId", "");
        }}
        selectedId={values?.schoolId}
      />

      <PickerModal
        visible={showClassModal}
        onClose={() => setShowClassModal(false)}
        options={filteredClasses}
        onSelect={(item) => {
          const id = item?.id ?? item?.schoolClassId ?? item?.classId ?? null;
          setFieldValue("classId", id);
        }}
        selectedId={values?.classId}
      />

      <PickerModal
        visible={showDivisionModal}
        onClose={() => setShowDivisionModal(false)}
        options={filteredDivisions}
        onSelect={(item) => {
          const id = item?.id ?? item?.divisionId ?? null;
          setFieldValue("divisionId", id);
        }}
        selectedId={values?.divisionId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: "100%" },
  fieldRow: { marginBottom: 12 },
  label: { marginBottom: 6, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  inputText: { color: "#000" },
  errorText: { color: "red", marginTop: 6 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: { backgroundColor: "#fff", borderRadius: 8, maxHeight: "70%" },
  optionRow: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  optionText: { color: "#111" },
  optionSelected: { fontWeight: "700", color: "#0a84ff" },
  closeButton: { padding: 12, alignItems: "center" },
  closeText: { color: "#0a84ff" },
  emptyRow: { padding: 16, alignItems: "center" },
  emptyText: { color: "#666" },
  loadingRow: { marginBottom: 12 },
});

SCDSelector.propTypes = {
  formik: PropTypes.shape({
    values: PropTypes.object.isRequired,
    setFieldValue: PropTypes.func.isRequired,
    touched: PropTypes.object,
    errors: PropTypes.object,
  }).isRequired,
  showSchool: PropTypes.bool,
  showClass: PropTypes.bool,
  showDivision: PropTypes.bool,
};

export default React.memo(SCDSelector);
