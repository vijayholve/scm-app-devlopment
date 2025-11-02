import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, Platform } from "react-native";
import {
  Button,
  Text,
  TextInput,
  HelperText,
  ActivityIndicator,
  Divider,
  Menu,
  List,
} from "react-native-paper";
// Native community datetime picker (common in RN projects). If not present, the code gracefully falls back to a text input.
import DateTimePicker from "@react-native-community/datetimepicker";
import { apiService } from "../../../api/apiService";
import { storage } from "../../../utils/storage";

type RoleOption = { id: string; name: string };
type Option = { id: string; name: string };

type Props = {
  id?: string | null;
  onClose: () => void;
  onSaved: () => void;
};

export const EditStudent: React.FC<Props> = ({ id, onClose, onSaved }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [roleMenuVisible, setRoleMenuVisible] = useState(false);

  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [schools, setSchools] = useState<Option[]>([]);
  const [classes, setClasses] = useState<Option[]>([]);
  const [divisions, setDivisions] = useState<Option[]>([]);

  const [form, setForm] = useState<any>({
    userName: "",
    password: "",
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    address: "",
    rollNo: "",
    dob: "",
    schoolId: "",
    classId: "",
    divisionId: "",
    role: null,
    status: "active",
  });

  useEffect(() => {
    const init = async () => {
      try {
        const raw = await storage.getItem("SCM-AUTH");
        const accId = raw ? JSON.parse(raw)?.data?.accountId : null;
        setAccountId(accId);
        if (accId) {
          const [rolesRes, schoolsRes, classesRes, divisionsRes] =
            await Promise.all([
              apiService.getRoles(accId),
              apiService.getSchools(accId),
              apiService.getClassesList(accId),
              apiService.getDivisions(accId),
            ]);
          setRoles(rolesRes);
          setSchools(schoolsRes);
          setClasses(classesRes);
          setDivisions(divisionsRes);
        }
        if (id) {
          const data = await apiService.getStudentById(id);
          setForm({
            userName: data.userName || "",
            password: "",
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            mobile: data.mobile || "",
            email: data.email || "",
            address: data.address || "",
            rollNo: String(data.rollNo || ""),
            dob: data.dob || "",
            schoolId: data.schoolId ? String(data.schoolId) : "",
            classId: data.classId ? String(data.classId) : "",
            divisionId: data.divisionId ? String(data.divisionId) : "",
            role: data.role
              ? { id: String(data.role.id), name: data.role.name }
              : null,
            status: data.status || "active",
          });
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const hasError = (key: string) => {
    if (key === "email") return form.email && !/.+@.+\..+/.test(form.email);
    if (key === "mobile")
      return form.mobile && !/^\d{10,15}$/.test(form.mobile);
    if (key === "rollNo") return !form.rollNo;
    return false;
  };

  const formatDate = (d: Date | string | undefined | null) => {
    if (!d) return "";
    const date = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(date.getTime())) return "";
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const onChangeDate = (_event: any, selected?: Date) => {
    // On Android the picker closes automatically; on iOS we keep it open for further changes
    if (selected) {
      setForm((f: any) => ({ ...f, dob: formatDate(selected) }));
    }
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
  };

  const onSave = async () => {
    if (!accountId) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        id: id || null,
        type: "STUDENT",
        accountId,
        role: form.role ? { id: form.role.id, name: form.role.name } : null,
      };
      if (id) {
        await apiService.updateStudentFull(payload);
      } else {
        await apiService.saveStudent(payload);
      }
      onSaved();
    } catch (e) {
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}
    >
      <Text variant="titleLarge" style={{ marginBottom: 12 }}>
        {id ? "Edit Student" : "Add Student"}
      </Text>

      <TextInput
        label="User Name"
        value={form.userName}
        onChangeText={(v) => setForm((f: any) => ({ ...f, userName: v }))}
        mode="outlined"
        style={styles.input}
      />
      {!id && (
        <TextInput
          label="Password"
          value={form.password}
          onChangeText={(v) => setForm((f: any) => ({ ...f, password: v }))}
          mode="outlined"
          style={styles.input}
        />
      )}
      <TextInput
        label="First Name"
        value={form.firstName}
        onChangeText={(v) => setForm((f: any) => ({ ...f, firstName: v }))}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Last Name"
        value={form.lastName}
        onChangeText={(v) => setForm((f: any) => ({ ...f, lastName: v }))}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Mobile"
        value={form.mobile}
        onChangeText={(v) => setForm((f: any) => ({ ...f, mobile: v }))}
        mode="outlined"
        style={styles.input}
        keyboardType="phone-pad"
      />
      {hasError("mobile") && (
        <HelperText type="error">Invalid mobile</HelperText>
      )}
      <TextInput
        label="Email"
        value={form.email}
        onChangeText={(v) => setForm((f: any) => ({ ...f, email: v }))}
        mode="outlined"
        style={styles.input}
        keyboardType="email-address"
      />
      {hasError("email") && <HelperText type="error">Invalid email</HelperText>}
      <TextInput
        label="Address"
        value={form.address}
        onChangeText={(v) => setForm((f: any) => ({ ...f, address: v }))}
        mode="outlined"
        style={styles.input}
        multiline
      />
      <TextInput
        label="Roll No"
        value={form.rollNo}
        onChangeText={(v) => setForm((f: any) => ({ ...f, rollNo: v }))}
        mode="outlined"
        style={styles.input}
      />
      {hasError("rollNo") && (
        <HelperText type="error">Roll No is required</HelperText>
      )}
      {/* Date of Birth - opens native date picker when focused/pressed */}
      <View>
        <TextInput
          label="Date of Birth"
          value={form.dob}
          onFocus={() => setShowDatePicker(true)}
          onPressIn={() => setShowDatePicker(true)}
          mode="outlined"
          style={styles.input}
          right={undefined}
        />
        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={form.dob ? new Date(form.dob) : new Date()}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={onChangeDate}
          />
        )}
      </View>

      <List.Subheader>School / Class / Division</List.Subheader>
      <List.Section>
        <List.Accordion
          title={
            schools.find((s) => String(s.id) === String(form.schoolId))?.name ||
            "Select School"
          }
        >
          {schools.map((s) => (
            <List.Item
              key={s.id}
              title={s.name}
              onPress={() =>
                setForm((f: any) => ({ ...f, schoolId: String(s.id) }))
              }
            />
          ))}
        </List.Accordion>
        <List.Accordion
          title={
            classes.find((c) => String(c.id) === String(form.classId))?.name ||
            "Select Class"
          }
        >
          {classes.map((c) => (
            <List.Item
              key={c.id}
              title={c.name}
              onPress={() =>
                setForm((f: any) => ({ ...f, classId: String(c.id) }))
              }
            />
          ))}
        </List.Accordion>
        <List.Accordion
          title={
            divisions.find((d) => String(d.id) === String(form.divisionId))
              ?.name || "Select Division"
          }
        >
          {divisions.map((d) => (
            <List.Item
              key={d.id}
              title={d.name}
              onPress={() =>
                setForm((f: any) => ({ ...f, divisionId: String(d.id) }))
              }
            />
          ))}
        </List.Accordion>
      </List.Section>

      <List.Subheader>Role</List.Subheader>
      <View>
        {/* Use a Menu anchored to a button so user sees available roles as a list */}
        <Menu
          visible={roleMenuVisible}
          onDismiss={() => setRoleMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setRoleMenuVisible(true)}
              style={styles.input}
            >
              {form.role?.name || "Select Role"}
            </Button>
          }
        >
          {roles.map((r) => (
            <Menu.Item
              key={r.id}
              onPress={() => {
                setForm((f: any) => ({
                  ...f,
                  role: { id: String(r.id), name: r.name },
                }));
                setRoleMenuVisible(false);
              }}
              title={r.name}
            />
          ))}
        </Menu>
      </View>

      <View style={styles.actions}>
        <Button mode="text" onPress={onClose}>
          Cancel
        </Button>
        <Button
          mode="contained"
          loading={saving}
          disabled={saving}
          onPress={onSave}
        >
          Save
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    marginBottom: 10,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 8,
  },
});

export default EditStudent;
