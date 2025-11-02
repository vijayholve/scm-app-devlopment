import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, TextInput, Card, HelperText } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../../api';
import { LoadingSpinner } from './LoadingSpinner';

// Define the structure for a form field
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select';
  required?: boolean;
  // For select fields
  options?: { label: string; value: any }[];
  optionsUrl?: string; // URL to fetch options from
}

interface ReusableFormProps {
  entityName: string;
  fields: FormField[];
  fetchUrl?: string;   // URL to get entity data for editing, e.g., /api/users/getById
  saveUrl: string;    // URL to create a new entity, e.g., /api/users/save
  updateUrl: string;  // URL to update an existing entity, e.g., /api/users/update
  transformForSubmit?: (data: any, isUpdate?: boolean) => any; // Function to transform data before submitting
  onSuccess?: (response: any) => void; // Callback on successful submission
  onSuccessUrl?: string; // URL to navigate to on success
  cancelButton?: React.ReactNode; // <--- ADDED
  showCancelButton?: boolean; // show default cancel button when true
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
  cancelButton, // <--- ADDED
  showCancelButton = true,
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = (route.params as { id?: string }) || {};

  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // Fetch initial data for editing
  useEffect(() => {
    if (id && fetchUrl) {
      const loadData = async () => {
        setLoading(true);
        try {
          // Correctly constructing the URL to fetch by ID
          const response = await api.get(`${fetchUrl}/${id}`);
          setFormData(response.data?.data || response.data || {});
        } catch (err) {
          console.error(err);
          Alert.alert('Error', `Failed to fetch ${entityName} details.`);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [id, fetchUrl, entityName]);

  const handleInputChange = (name: string, value: string) => {
  setFormData((prev: any) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors: any = {};
    fields.forEach((field) => {
      // Skip password validation for update if field is not touched/empty
      if (id && field.name === 'password' && !formData[field.name]) {
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

      Alert.alert('Success', `${entityName} ${id ? 'updated' : 'saved'} successfully!`);
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      if (onSuccessUrl) {
        navigation.navigate(onSuccessUrl as never);
      } else {
        navigation.goBack();
      }

    } catch (error: any) {
      console.error('Submission Error:', error);
      Alert.alert('Error', error.response?.data?.message || `Failed to ${id ? 'update' : 'save'} ${entityName}.`);
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
              <TextInput
                label={field.label}
                value={formData[field.name] || ''}
                onChangeText={(text) => handleInputChange(field.name, text)}
                mode="outlined"
                // Hide password field value on edit unless user is typing a new one
                secureTextEntry={field.type === 'password'}
                keyboardType={field.type === 'email' ? 'email-address' : 'default'}
                error={!!errors[field.name]}
              />
              {errors[field.name] && <HelperText type="error">{errors[field.name]}</HelperText>}
            </View>
          ))}
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            loading={loading}
            disabled={loading}
          >
            {id ? 'Update' : 'Save'}
          </Button>

          {/* Render custom cancelButton if provided; otherwise render a default Cancel when enabled */}
          {cancelButton ? (
            cancelButton
          ) : (
            showCancelButton && (
              <Button mode="outlined" onPress={() => navigation.goBack()} style={[styles.button, styles.cancelButton]}>
                Cancel
              </Button>
            )
          )}
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
  cancelButton: {
    marginTop: 8,
  },
});