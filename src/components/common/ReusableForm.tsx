import React from 'react';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import * as Yup from 'yup';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; 
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

// ===================================
// 1. Interface and Type Definitions
// ===================================

export interface IFormField {
  name: string;
  labelKey: string; 
  type: 'text' | 'password' | 'email' | 'tel' | 'number' | 'date' | 'select' | 'textarea';
  widthMultiplier?: number; 
  disabled?: boolean | ((values: any, isEditMode: boolean) => boolean);
  options?: any[]; 
  inputProps?: TextInput['props']; 
}

export interface IReusableFormProps<T extends object> {
  initialValues: T;
  validationSchema: Yup.ObjectSchema<any>;
  onSubmit: (values: T, formikHelpers: FormikHelpers<T>) => void | Promise<any>;
  fields: IFormField[];
  isEditMode: boolean;
  cancelAction: () => void;
  tNamespace: string; 
  renderCustomContent?: (formikProps: FormikProps<T>) => React.ReactNode; 
}

// ===================================
// 2. Constants and Styles
// ===================================

const colors = {
    primary: '#6200EE',
    secondary: '#03DAC6',
    background: '#F5F5F5',
    card: '#FFFFFF',
    text: '#000000',
    error: '#B00020',
    divider: '#BDBDBD',
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { paddingHorizontal: 16, paddingBottom: 100 }, 
  formRow: { 
      flexDirection: 'row', 
      flexWrap: 'wrap', 
      marginHorizontal: -8, 
  },
  fieldContainer: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  input: {
    height: 48,
    borderColor: colors.divider,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.card,
    fontSize: 16,
  },
  inputError: {
    borderColor: colors.error,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
  // Sticky Footer Styles
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderColor: colors.divider,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginLeft: 10,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: colors.secondary, 
  },
  cancelButton: {
    backgroundColor: colors.divider,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
  },
  cancelText: {
    color: colors.text,
  }
});


// ===================================
// 3. Main Component
// ===================================

const ReusableForm = <T extends object>({
  initialValues,
  validationSchema,
  onSubmit,
  fields,
  isEditMode,
  cancelAction,
  tNamespace,
  renderCustomContent
}: IReusableFormProps<T>) => {
  const { t } = useTranslation([tNamespace, 'common']);
  
  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
    >
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {(formikProps) => {
          const { errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue } = formikProps;

          // Function to render a single field
          const renderField = (field: IFormField) => {
            const fieldName = field.name as keyof T & string;
            const error = errors[fieldName];
            const isTouched = touched[fieldName];
            const hasError = Boolean(isTouched && error);

            const isDisabled = typeof field.disabled === 'function' 
                             ? field.disabled(values, isEditMode) 
                             : field.disabled;

            const label = t(`${tNamespace}:fields.${field.labelKey || fieldName}`);
            const width = field.widthMultiplier === 0.5 ? '50%' : '100%';
            
            const inputProps: TextInput['props'] = {
                ...field.inputProps,
                onBlur: handleBlur(fieldName),
                value: (values[fieldName] as unknown as string) || '',
                editable: !isDisabled,
            };

            // 1. Handle Select (Picker)
            if (field.type === 'select' && field.options) {
                const selectedValue = (values[fieldName] as unknown as {id: string | number} | null)?.id;
                
                return (
                    <View style={[styles.fieldContainer, { width }]} key={fieldName}>
                        <Text style={styles.label}>{label}</Text>
                        <View style={[styles.input, { paddingHorizontal: 0, borderWidth: hasError ? 2 : 1 }, hasError && styles.inputError]}>
                            <Picker
                                selectedValue={selectedValue}
                                onValueChange={(itemValue) => {
                                    // Assumes options have { id, name } structure
                                    const selectedOption = field.options!.find(opt => String(opt.id) === String(itemValue)) || null;
                                    setFieldValue(fieldName, selectedOption);
                                }}
                                enabled={!isDisabled}
                            >
                                <Picker.Item label={t('common:select') || 'Select...'} value={null} />
                                {field.options.map((option) => (
                                    <Picker.Item key={String(option.id)} label={option.name || String(option.id)} value={option.id} />
                                ))}
                            </Picker>
                        </View>
                        {hasError && <Text style={styles.errorText}>{error as string}</Text>}
                    </View>
                );
            }

            // 2. Handle Date input (simulated via text input for YYYY-MM-DD format consistency)
            if (field.type === 'date') {
                return (
                    <View style={[styles.fieldContainer, { width }]} key={fieldName}>
                        <Text style={styles.label}>{label}</Text>
                        <TextInput
                            placeholder={t('common:formatYYYYMMDD') || 'YYYY-MM-DD'}
                            style={[styles.input, hasError && styles.inputError]}
                            onChangeText={handleChange(fieldName)}
                            keyboardType="number-pad" 
                            {...inputProps}
                        />
                        {hasError && <Text style={styles.errorText}>{error as string}</Text>}
                    </View>
                );
            }
            
            // 3. Handle Text/Email/Password/Tel/Number/TextArea
            let keyboardType: TextInput['props']['keyboardType'] = 'default';
            if (field.type === 'email') keyboardType = 'email-address';
            if (field.type === 'tel') keyboardType = 'phone-pad';
            if (field.type === 'number') keyboardType = 'number-pad';
            
            const isMultiline = field.type === 'textarea' || field.multiline;

            return (
              <View style={[styles.fieldContainer, { width }]} key={fieldName}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                  style={[
                      styles.input, 
                      isMultiline && styles.textArea,
                      hasError && styles.inputError
                  ]}
                  onChangeText={handleChange(fieldName)}
                  secureTextEntry={field.type === 'password'}
                  keyboardType={keyboardType}
                  multiline={isMultiline}
                  numberOfLines={field.rows || (isMultiline ? 4 : 1)}
                  textAlignVertical={isMultiline ? 'top' : 'center'}
                  {...inputProps}
                />
                {hasError && <Text style={styles.errorText}>{error as string}</Text>}
              </View>
            );
          };

          return (
            <View style={styles.container}>
              <ScrollView 
                contentContainerStyle={styles.scrollView}
                keyboardShouldPersistTaps="handled" 
              >
                  <View style={styles.formRow}>
                      {fields.map(renderField)}
                      
                      {/* Render Custom Content/Fields */}
                      {renderCustomContent && renderCustomContent(formikProps)}
                  </View>
              </ScrollView>
              
              {/* Sticky Footer (Fixed position View) */}
              <View style={styles.footerContainer}>
                <TouchableOpacity 
                    style={[styles.button, styles.cancelButton]}
                    onPress={cancelAction}
                    disabled={isSubmitting}
                >
                  <Text style={[styles.buttonText, styles.cancelText]}>{t('common:cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.button, styles.saveButton]}
                    onPress={handleSubmit as any}
                    disabled={isSubmitting}
                >
                  <Text style={styles.buttonText}>{isSubmitting ? t('common:loading') : t('common:save')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      </Formik>
    </KeyboardAvoidingView>
  );
};

ReusableForm.propTypes = {
    initialValues: PropTypes.object.isRequired,
    validationSchema: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
    fields: PropTypes.array.isRequired,
    isEditMode: PropTypes.bool.isRequired,
    cancelAction: PropTypes.func.isRequired,
    tNamespace: PropTypes.string.isRequired,
    renderCustomContent: PropTypes.func,
};

export default ReusableForm;
