import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native'; // <--- NEW IMPORTS
import { ReusableForm, FormField } from '../../../components/common/ReusableForm';

// Define the full set of fields for the form based on user's payload
const studentFormFields: FormField[] = [
  // Authentication/Login details
  { name: 'userName', label: 'User Name', type: 'text', required: true },
  { name: 'password', label: 'Password', type: 'password', required: true },
  // Personal details
  { name: 'firstName', label: 'First Name', type: 'text', required: true },
  { name: 'lastName', label: 'Last Name', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'mobile', label: 'Mobile', type: 'number', required: true },
  { name: 'address', label: 'Address', type: 'text', required: false },
  // NOTE: Assuming your API uses 'dob' and the format 'YYYY-MM-DD'
  { name: 'dob', label: 'Date of Birth (YYYY-MM-DD)', type: 'text', required: true }, 
  // School/Class details (Assuming text input for now, should be a select/picker in a real app)
  { name: 'rollNo', label: 'Roll No', type: 'number', required: true },
  // { name: 'classId', label: 'Class ID', type: 'number', required: true }, 
  // { name: 'divisionId', label: 'Division ID', type: 'number', required: true },
  // { name: 'schoolId', label: 'School ID', type: 'number', required: true },
];

// Transformation function to match the API payload
const transformStudentData = (data: any, isUpdate: boolean) => {
    const transformed = {
        ...data,
        // Enforce fixed API fields
        type: 'STUDENT',
        status: 'active',
        // Assuming role ID 2 is for Student as per your sample payload
        role: { id: 2, name: 'Student' }, 
        
        // Map DOB field (API payload had 'bateOfBirth' and 'dob', using 'dob' for consistency)
        dob: data.dob, 
        bateOfBirth: data.dob, 
        
        // Ensure IDs/numbers are converted to integers for the API
        rollNo: data.rollNo ? parseInt(data.rollNo, 10) : null,
        classId: data.classId ? parseInt(data.classId, 10) : null,
        divisionId: data.divisionId ? parseInt(data.divisionId, 10) : null,
        schoolId: data.schoolId ? parseInt(data.schoolId, 10) : null,
        
    };
    
    // Remove password if we are updating and the password field is empty
    if (isUpdate && !data.password) {
        delete transformed.password;
    }

    return transformed;
};

export const AddEditStudent: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = (route.params as { id?: string }) || {};

  const handleCancel = () => {
    navigation.goBack();
  };
  
  // Custom transformation function for ReusableForm
  const handleTransform = (data: any) => {
    return transformStudentData(data, !!id);
  }

  return (
    <ReusableForm
      entityName="Student"
      fields={studentFormFields}
      fetchUrl="/api/users/getById"
      saveUrl="/api/users/save"
      updateUrl="/api/users/update"
      onSuccessUrl="StudentList"
      transformForSubmit={handleTransform} // Pass transformation function
      
      // Pass the custom Cancel Button to the ReusableForm component
      cancelButton={
        <Button mode="outlined" onPress={handleCancel} style={styles.cancelButton}>
          Cancel
        </Button>
      }
    />
  );
};

const styles = StyleSheet.create({
  cancelButton: {
    marginTop: 10,
    marginBottom: 20, 
  },
});