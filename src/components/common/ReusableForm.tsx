import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert, Platform } from "react-native";
import { Button, TextInput, Card, HelperText } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { storage } from "../../utils/storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import api from "../../api";
import { LoadingSpinner } from "./LoadingSpinner";
import SCDSelectorNative from "./SCDSelector.native";
// Define the structure for a form field
export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "number" | "select" | "date";
  required?: boolean;
  // For select fields
  options?: { label: string; value: any }[];
  // optionsUrl may contain placeholders like {accountId} or {id}
  optionsUrl?: string; // URL to fetch options from
  // HTTP method to use when fetching options (some endpoints expect POST with paging body)
  optionsMethod?: "get" | "post";
  // Optional query params to append when using GET
  optionsQuery?: Record<string, string>;
}

interface ReusableFormProps {
  entityName: string;
  fields: FormField[];
  fetchUrl?: string; // URL to get entity data for editing, e.g., /api/users/getById
  saveUrl: string; // URL to create a new entity, e.g., /api/users/save
  updateUrl: string; // URL to update an existing entity, e.g., /api/users/update
  transformForSubmit?: (data: any, isUpdate?: boolean) => any; // Function to transform data before submitting
  onSuccess?: (response: any) => void; // Callback on successful submission
  onSuccessUrl?: string; // URL to navigate to on success
  cancelButton?: React.ReactNode; // optional custom cancel button node
  showCancelButton?: boolean; // show default cancel button when true
  showSCDSelector?: boolean; // show SCDSelector for school/class/division selection
}

export const ReusableForm: React.FC<ReusableFormProps> = ({
  entityName,
  fields,
  fetchUrl,
  saveUrl,
  updateUrl,
  transformForSubmit,
  onSuccess,
  onSuccessUrl,
  cancelButton,
  showCancelButton = true,
  showSCDSelector = true,
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = (route.params as { id?: string }) || {};

  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  // For select-type fields: store fetched or provided options per field
  const [selectOptions, setSelectOptions] = useState<
    Record<string, any[] | undefined>
  >({});
  // Track which per-field option lists are visible (simple inline menu)
  const [menusVisible, setMenusVisible] = useState<Record<string, boolean>>({});

  // Fetch initial data for editing
  useEffect(() => {
    if (id && fetchUrl) {
      const loadData = async () => {
        setLoading(true);
        try {
          // Try common patterns for fetch by id: /{id} or ?id={id}
          let response;
          try {
            response = await api.get(`${fetchUrl}/${id}`);
          } catch (err1) {
            // fallback to query param style
            try {
              response = await api.get(`${fetchUrl}?id=${id}`);
            } catch {
              throw err1; // rethrow original
            }
          }
          const raw = response.data?.data || response.data || {};
          // Normalize common fields that other components expect as strings
          const normalizeDate = (val: any) => {
            if (!val) return "";
            const d = new Date(val);
            if (Number.isNaN(d.getTime())) return "";
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            return `${yyyy}-${mm}-${dd}`;
          };

          const normalized = {
            ...raw,
            classId: raw.classId ? String(raw.classId) : "",
            divisionId: raw.divisionId ? String(raw.divisionId) : "",
            schoolId: raw.schoolId ? String(raw.schoolId) : "",
            rollNo: raw.rollNo ? String(raw.rollNo) : "",
            dob: normalizeDate(raw.dob || raw.date_of_birth),
          };

          setFormData(normalized);
        } catch (err) {
          console.error(err);
          Alert.alert("Error", `Failed to fetch ${entityName} details.`);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [id, fetchUrl, entityName]);

  // If fields define options or optionsUrl, populate selectOptions
  useEffect(() => {
    fields.forEach((field) => {
      if (field.type === "select") {
        // local options already provided
        if (field.options && field.options.length) {
          setSelectOptions((prev) => ({
            ...prev,
            [field.name]: field.options,
          }));
        } else if (field.optionsUrl) {
          // fetch remote options
          (async () => {
            try {
              let url = field.optionsUrl;
              if (!url) return;
              // replace placeholders like {accountId}
              try {
                const raw = await storage.getItem("SCM-AUTH");
                const accId = raw ? JSON.parse(raw)?.data?.accountId : null;
                if (accId) {
                  url = url.replace("{accountId}", String(accId));
                }
              } catch {
                // ignore
              }

              let resp;
              if (field.optionsMethod === "post") {
                // include a simple paging body as many endpoints expect
                const body = {
                  page: 0,
                  size: 1000,
                  sortBy: "id",
                  sortDir: "asc",
                  search: "",
                };
                resp = await api.post(url, body);
              } else {
                // append query params if provided
                if (field.optionsQuery) {
                  const qp = Object.entries(field.optionsQuery)
                    .map(
                      ([k, v]) =>
                        `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
                    )
                    .join("&");
                  url = url + (url.includes("?") ? "&" : "?") + qp;
                }
                resp = await api.get(url);
              }
              // normalize: try resp.data.data, or resp.data
              const items = resp.data?.data || resp.data || [];
              // try to map items to { label, value } if they don't already match
              const normalized = items.map((it: any) => {
                if (it && typeof it === "object") {
                  // common shape: { id, name } or { value, label }
                  if ("label" in it && "value" in it) return it;
                  if ("id" in it && "name" in it)
                    return { label: it.name, value: it.id };
                  // fallback: stringify
                  return {
                    label: it.name || it.label || String(it),
                    value: it.id ?? it.value ?? it,
                  };
                }
                return { label: String(it), value: it };
              });
              setSelectOptions((prev) => ({
                ...prev,
                [field.name]: normalized,
              }));
            } catch (err) {
              console.error(
                "Failed to fetch select options for",
                field.name,
                err
              );
            }
          })();
        }
      }
    });
  }, [fields]);

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: null }));
    }
  };

  const toggleMenu = (name: string, visible: boolean) => {
    setMenusVisible((prev) => ({ ...prev, [name]: visible }));
  };

  const [dateFieldVisible, setDateFieldVisible] = useState<
    Record<string, boolean>
  >({});
  const showDatePickerFor = (name: string, show: boolean) =>
    setDateFieldVisible((p) => ({ ...p, [name]: show }));
  const onChangeDateField = (
    fieldName: string,
    _event: any,
    selected?: Date
  ) => {
    if (selected) {
      const yyyy = selected.getFullYear();
      const mm = String(selected.getMonth() + 1).padStart(2, "0");
      const dd = String(selected.getDate()).padStart(2, "0");
      handleInputChange(fieldName, `${yyyy}-${mm}-${dd}`);
    }
    if (Platform.OS === "android") {
      showDatePickerFor(fieldName, false);
    }
  };

  const validate = () => {
    const newErrors: any = {};
    fields.forEach((field) => {
      // Skip password validation for update if field is not touched/empty
      if (id && field.name === "password" && !formData[field.name]) {
        return;
      }

      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required.`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    let data = formData;

    // Pass context (isUpdate) to the transform function
    if (transformForSubmit) {
      data = transformForSubmit(data, !!id);
    }

    try {
      let response;
      if (id) {
        response = await api.put(`${updateUrl}/${id}`, data);
      } else {
        response = await api.post(saveUrl, data);
      }

      Alert.alert(
        "Success",
        `${entityName} ${id ? "updated" : "saved"} successfully!`
      );

      if (onSuccess) {
        onSuccess(response.data);
      }

      if (onSuccessUrl) {
        navigation.navigate(onSuccessUrl as never);
      } else {
        navigation.goBack();
      }
    } catch (error: any) {
      console.error("Submission Error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          `Failed to ${id ? "update" : "save"} ${entityName}.`
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && !Object.keys(formData).length) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title={id ? `Edit ${entityName}` : `Add ${entityName}`} />
        <Card.Content>
          {fields.map((field) => (
            <View key={field.name} style={styles.inputContainer}>
              {field.type === "select" ? (
                <View>
                  <Button
                    mode="outlined"
                    onPress={() => toggleMenu(field.name, true)}
                    style={styles.button}
                  >
                    {(() => {
                      const raw = formData[field.name];
                      const opts = selectOptions[field.name] || [];
                      const valId =
                        raw && typeof raw === "object"
                          ? raw.id ?? raw.value
                          : raw;
                      const found = opts.find(
                        (o: any) =>
                          String(o.value ?? o.id ?? o) === String(valId)
                      );
                      if (found)
                        return found.label ?? found.name ?? String(valId);
                      // If raw is an object with a name, prefer that
                      if (raw && typeof raw === "object")
                        return raw.name ?? String(valId);
                      return raw || `Select ${field.label}`;
                    })()}
                  </Button>

                  {/* Inline simple options list - closes on select */}
                  {menusVisible[field.name] && (
                    <Card style={styles.selectCard}>
                      {(selectOptions[field.name] || []).map((opt: any) => (
                        <Button
                          key={opt.value ?? opt.id ?? opt}
                          mode="text"
                          onPress={() => {
                            handleInputChange(
                              field.name,
                              opt.value ?? opt.id ?? opt
                            );
                            toggleMenu(field.name, false);
                          }}
                        >
                          {opt.label ?? opt.name ?? String(opt)}
                        </Button>
                      ))}
                    </Card>
                  )}
                  {errors[field.name] && (
                    <HelperText type="error">{errors[field.name]}</HelperText>
                  )}
                </View>
              ) : field.type === "date" ? (
                <View>
                  <TextInput
                    label={field.label}
                    value={formData[field.name] || ""}
                    onFocus={() => showDatePickerFor(field.name, true)}
                    onPressIn={() => showDatePickerFor(field.name, true)}
                    mode="outlined"
                  />
                  {dateFieldVisible[field.name] && (
                    <DateTimePicker
                      testID={`dateTimePicker-${field.name}`}
                      value={
                        formData[field.name]
                          ? new Date(formData[field.name])
                          : new Date()
                      }
                      mode="date"
                      display="default"
                      maximumDate={new Date()}
                      onChange={(e: any, d?: Date | undefined) =>
                        onChangeDateField(field.name, e, d)
                      }
                    />
                  )}
                  {errors[field.name] && (
                    <HelperText type="error">{errors[field.name]}</HelperText>
                  )}
                </View>
              ) : (
                <>
                  <TextInput
                    label={field.label}
                    value={formData[field.name] || ""}
                    onChangeText={(text) => handleInputChange(field.name, text)}
                    mode="outlined"
                    // Hide password field value on edit unless user is typing a new one
                    secureTextEntry={field.type === "password"}
                    keyboardType={
                      field.type === "email" ? "email-address" : "default"
                    }
                    error={!!errors[field.name]}
                  />
                  {errors[field.name] && (
                    <HelperText type="error">{errors[field.name]}</HelperText>
                  )}
                </>
              )}
            </View>
          ))}
          {showSCDSelector && (
            <SCDSelectorNative
              formik={{
                values: formData,
                setFieldValue: (field: string, value: any) =>
                  handleInputChange(field, value),
                // ReusableForm tracks validation errors in `errors`. We don't currently track `touched` per-field,
                // so provide an empty object; SCDSelector checks touched before showing error messages.
                touched: {},
                errors: errors || {},
              }}
            />
          )}
          <View style={styles.actionsRow}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              {cancelButton ? (
                // render custom cancel node provided by parent
                (cancelButton as any)
              ) : (
                <Button
                  mode="outlined"
                  onPress={() => navigation.goBack()}
                  style={styles.cancelButton}
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.button}
                loading={loading}
                disabled={loading}
              >
                {id ? "Update" : "Save"}
              </Button>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  card: {
    padding: 8,
  },
  inputContainer: {
    marginBottom: 12,
  },
  button: {
    marginTop: 16,
    marginBottom: 8, // Added margin to space out Save and Cancel buttons
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  cancelButton: {
    marginTop: 0,
  },

  selectCard: {
    marginTop: 8,
    padding: 8,
  },
});
