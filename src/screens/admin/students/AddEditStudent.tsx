import React, { useState, useEffect } from "react";
// no local StyleSheet used
import { useNavigation, useRoute } from "@react-navigation/native"; // <--- NEW IMPORTS
import ReusableForm, { IFormField as FormField } from "../../../components/common/ReusableForm";
import * as Yup from 'yup';
import api, { userDetails } from '../../../api';

// fields defined inside component

// Transformation function to match the API payload
const transformStudentData = (data: any, isUpdate: boolean) => {
  const transformed = {
    ...data,
    // Enforce fixed API fields
    type: "STUDENT",
    status: "active",
    // If the form provided a role (id or object), use it; otherwise keep default Student role
    role:
      data.role && typeof data.role === "object" && "id" in data.role
        ? { id: data.role.id, name: data.role.name }
        : data.role
        ? { id: parseInt(String(data.role), 10), name: undefined }
        : { id: 2, name: "Student" },

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
  const isEditMode = !!id;
  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    const acc = userDetails.getAccountId();
    if (!acc) return;
    const url = `/api/roles/getAll/${acc}`;
    (async () => {
      try {
        const resp = await api.post(url, { page: 0, size: 1000, sortBy: 'id', sortDir: 'asc', search: '' });
        setRoles(resp.data?.content || []);
      } catch (err) {
        console.error('Failed to fetch roles', err);
      }
    })();
  }, []);

  // Custom transformation function for ReusableForm
  const handleTransform = (data: any) => {
    return transformStudentData(data, !!id);
  };
  // Define fields for ReusableForm (use labelKey as i18n key), include fetched roles
  const studentFormFields: FormField[] = [
    { name: 'userName', labelKey: 'userName', type: 'text', widthMultiplier: 0.5 },
    { name: 'password', labelKey: 'password', type: 'password', widthMultiplier: 0.5, disabled: isEditMode },
    { name: 'firstName', labelKey: 'firstName', type: 'text', widthMultiplier: 0.5 },
    { name: 'lastName', labelKey: 'lastName', type: 'text', widthMultiplier: 0.5 },
    { name: 'mobile', labelKey: 'mobile', type: 'tel', widthMultiplier: 0.5 },
    { name: 'email', labelKey: 'email', type: 'email', widthMultiplier: 0.5 },
    { name: 'dob', labelKey: 'dateOfBirth', type: 'date', widthMultiplier: 0.5 },
    { name: 'rollNo', labelKey: 'rollNo', type: 'number', widthMultiplier: 0.5 },
  { name: 'address', labelKey: 'address', type: 'textarea', widthMultiplier: 1.0, multiline: true, inputProps: { numberOfLines: 3 } },
    { name: 'role', labelKey: 'role', type: 'select', widthMultiplier: 1.0, options: roles },
  ];

  // Build initialValues object for ReusableForm based on fields
  const initialValues: any = {};
  studentFormFields.forEach((f) => {
    if (f.type === 'select') initialValues[f.name] = null;
    else initialValues[f.name] = '';
  });

  const validationSchema = Yup.object().shape({
    userName: Yup.string().required('User Name is required'),
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    mobile: Yup.string().required('Mobile is required'),
    rollNo: Yup.string().required('Roll No is required'),
    dob: Yup.string().required('Date of Birth is required'),
    role: Yup.mixed().required('Role is required'),
  });

  const onSubmit = async (values: any, formikHelpers: any) => {
    const payload = handleTransform(values);
    try {
      if (isEditMode) {
        await api.put('/api/users/update', payload);
      } else {
        await api.post('/api/users/save', payload);
      }
      navigation.navigate('StudentList' as never);
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      formikHelpers.setSubmitting(false);
    }
  };

  return (
    <ReusableForm
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      fields={studentFormFields as FormField[]}
      isEditMode={isEditMode}
      cancelAction={() => navigation.goBack()}
      tNamespace="student"
    />
  );
};

// no local styles needed
