import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
// Using react-router-dom for navigation based on your original file's structure.
import { useParams, useNavigate } from 'react-router-dom'; 
// Import React Native core components
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'; 
import * as Yup from 'yup';
// Assuming 'react-hot-toast' is handled or polyfilled in your RN environment
import { toast, Toaster } from 'react-hot-toast'; 
import PropTypes from 'prop-types';
import { FormikProps, FormikHelpers } from 'formik';

// --- RN-COMPATIBLE IMPORTS (These need to be correct exports) ---
// Note: SCDSelector is assumed to be an RN component defined elsewhere in your project.
import MainCard from '../../../ui-component/cards/MainCard';
import ReusableLoader from '../../../components/common/ReusableLoader';
import UserDocumentManager from '../../../views/UserDocumentManager';
import SCDSelectorNative from '../../../components/common/SCDSelector.native';
import ReusableForm, { IFormField } from '../../../components/common/ReusableForm';

// Assuming common utilities and store structure exists
import api,{userDetails} from '../../../api';
import { useSelector } from 'react-redux'; 

// ====================================================================================
// 1. Types and Initial State
// ====================================================================================

interface Role {
    id: number | string;
    name: string;
}

interface IStudentFormValues {
    userName: string;
    password?: string;
    firstName: string;
    lastName: string;
    mobile: string;
    email: string;
    address: string;
    rollNo: string;
    dob: string; 
    schoolId: string;
    schoolName: string;
    classId: string;
    className: string;
    divisionId: string;
    divisionName: string;
    role: Role | null;
    status: 'active' | 'inactive';
}

const initialStudentState: IStudentFormValues = {
  userName: '',
  password: '',
  firstName: '',
  lastName: '',
  mobile: '',
  email: '',
  address: '',
  rollNo: '',
  dob: '',
  schoolId: '',
  schoolName: '',
  classId: '',
  className: '',
  divisionId: '',
  divisionName: '',
  role: null,
  status: 'active'
};

// ====================================================================================
// 2. Tab Helper (RN Style - Simple Emulation)
// ====================================================================================

const colors = {
    primary: '#6200EE',
    secondary: '#03DAC6',
    text: '#000000',
    divider: '#E0E0E0',
    card: '#FFFFFF',
    background: '#F5F5F5',
};

const RNTabPanel = ({ children, value, index }) => {
    if (value !== index) {
        return null;
    }
    return <View style={styles.tabContent}>{children}</View>;
};
RNTabPanel.propTypes = { children: PropTypes.node, value: PropTypes.number.isRequired, index: PropTypes.number.isRequired };


const RNTabs = ({ value, onChange, tabs, tNamespace }) => {
    const { t } = useTranslation([tNamespace]);
    return (
        <View style={styles.tabBar}>
            {tabs.map((tab, index) => (
                <TouchableOpacity
                    key={index}
                    style={[styles.tab, value === index && styles.activeTab]}
                    onPress={() => onChange(index)}
                >
                    <Text style={[styles.tabText, value === index && styles.activeTabText]}>
                        {t(`${tNamespace}:tabs.${tab.labelKey}`)}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};
RNTabs.propTypes = {
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    tabs: PropTypes.array.isRequired,
    tNamespace: PropTypes.string.isRequired,
};


// ====================================================================================
// 3. Main Component Logic (EditStudent)
// ====================================================================================

const EditStudent = () => {
  const navigate = useNavigate();
  const { id: userId } = useParams();
  const isEditMode = !!userId;
  const { t } = useTranslation(['edit', 'common', 'student']); 

  const [loader, setLoader] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [studentData, setStudentData] = useState<IStudentFormValues>(initialStudentState);
  const user = useSelector((state: any) => state.user);
  const [tabValue, setTabValue] = useState(0); 

  const handleCancel = () => {
    navigate('/masters/students');
  }

  const handleTabChange = (newValue: number) => {
    setTabValue(newValue);
  };
    
  const fetchData = useCallback(async (endpoint: string, setter: (data: any[]) => void, typeFilter = '') => {
    const accountId = userDetails.getAccountId();
    if (!accountId) return;
    let url = `${endpoint}/${accountId}`;
    if (typeFilter) url += `?type=${typeFilter}`;

    try {
      const response = await api.post(url, { page: 0, size: 1000, sortBy: 'id', sortDir: 'asc', search: '' });
      setter(response.data.content || []);
    } catch (error) {
      console.error(`Failed to fetch ${endpoint}:`, error);
      toast.error(t('student:messages.fetchFailed'));
    }
  }, [t]);

  const fetchStudentData = useCallback(
    async (id: string) => {
      setLoader(true);
      try {
        const response = await api.get(`api/users/getById?id=${id}`);
        
        const formatDateForInput = (val: string | Date | undefined | null): string => {
          if (!val) return '';
          try {
              const dateValue = response.data.date_of_birth || response.data.dob;
              const d = new Date(dateValue);
              if (Number.isNaN(d.getTime())) return '';
              const yyyy = d.getFullYear();
              const mm = String(d.getMonth() + 1).padStart(2, '0');
              const dd = String(d.getDate()).padStart(2, '0');
              return `${yyyy}-${mm}-${dd}`;
          } catch {
              return ''; 
          }
        };

        const fetchedData: IStudentFormValues = {
          ...response.data,
          classId: response.data.classId ? String(response.data.classId) : '',
          divisionId: response.data.divisionId ? String(response.data.divisionId) : '',
          rollNo: response.data.rollNo ? String(response.data.rollNo) : '',
          schoolId: response.data.schoolId || '',
          dob: formatDateForInput(response.data.dob), 
          role: response.data.role
            ? roles.find((r) => String(r.id) === String(response.data.role.id)) || {
                id: response.data.role.id,
                name: response.data.role.name
              }
            : null,
          password: '' 
        };
        setStudentData(fetchedData);
      } catch (error) {
        console.error('Failed to fetch student data:', error);
        toast.error(t('student:messages.fetchFailed'));
      } finally {
        setLoader(false);
      }
    },
    [roles, t]
  );

  useEffect(() => {
    fetchData('api/roles/getAll', setRoles);
  }, [fetchData]);

  useEffect(() => {
    if (userId && roles.length > 0) {
      fetchStudentData(userId);
    } else if (!userId) {
      setStudentData(initialStudentState);
    }
  }, [userId, roles, fetchStudentData]);


  const StudentValidationSchema = Yup.object().shape({
    email: Yup.string().email(t('student:validation.emailInvalid')).max(255).required(t('student:validation.emailRequired')),
    password: isEditMode
      ? Yup.string().max(255).notRequired()
      : Yup.string().max(255).required(t('student:validation.passwordRequired')),
    userName: Yup.string().max(255).required(t('student:validation.userNameRequired')),
    firstName: Yup.string().max(255).required(t('student:validation.firstNameRequired')),
    lastName: Yup.string().max(255).required(t('student:validation.lastNameRequired')),
    mobile: Yup.string()
      .matches(/^[0-9]+$/, t('student:validation.mobileDigitsOnly'))
      .min(10, t('student:validation.mobileMin'))
      .max(15, t('student:validation.mobileMax'))
      .required(t('student:validation.mobileRequired')),
    rollNo: Yup.string().required(t('student:validation.rollNoRequired')),
    dob: Yup.date() 
      .nullable()
      .max(new Date(), t('student:validation.dobFuture'))
      .required(t('student:validation.dobRequired')),
    classId: Yup.string().required(t('student:validation.classRequired')),
    divisionId: Yup.string().required(t('student:validation.divisionRequired')),
    role: Yup.object().nullable().required(t('student:validation.roleRequired'))
  });

  const handleSubmit = async (values: IStudentFormValues, { setSubmitting }: FormikHelpers<IStudentFormValues>) => {
    const userData = {
      ...values,
      id: userId || null,
      type: 'STUDENT',
      accountId: userDetails.getAccountId(),
      status: 'active',
      dob: values.dob || null, 
      dateOfBirth: values.dob || null, 
      role: values.role ? { id: values.role.id, name: values.role.name } : null
    };

    try {
      const apiCall = userId ? api.put(`api/users/update`, userData) : api.post(`api/users/save`, userData);
      await apiCall;

      toast.success(t(userId ? 'student:messages.updateSuccess' : 'student:messages.createSuccess'), {
        onClose: () => {
          navigate('/masters/students');
        }
      });
    } catch (error) {
      const backendMessage = (error as any)?.response?.data?.message || (error as any)?.message || t('student:messages.saveError');
      console.error('Failed to save student data:', error);
      toast.error(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };


  const Title = userId ? t('student:title.edit') : t('student:title.add');

  if (loader) {
    return <ReusableLoader message={t('student:messages.loading')} />;
  }

  const standardFields: IFormField[] = [
      { name: 'userName', labelKey: 'userName', type: 'text', widthMultiplier: 0.5 },
      { 
          name: 'password', 
          labelKey: 'password', 
          type: 'password', 
          widthMultiplier: 0.5,
          disabled: isEditMode 
      },
      { name: 'firstName', labelKey: 'firstName', type: 'text', widthMultiplier: 0.5 },
      { name: 'lastName', labelKey: 'lastName', type: 'text', widthMultiplier: 0.5 },
      { name: 'mobile', labelKey: 'mobile', type: 'tel', widthMultiplier: 0.5 },
      { name: 'email', labelKey: 'email', type: 'email', widthMultiplier: 0.5 },
      { 
          name: 'dob', 
          labelKey: 'dateOfBirth', 
          type: 'date', 
          widthMultiplier: 0.5, 
      },
      { name: 'rollNo', labelKey: 'rollNo', type: 'number', widthMultiplier: 0.5 },
      { 
          name: 'address', 
          labelKey: 'address', 
          type: 'textarea', 
          widthMultiplier: 1.0, 
          rows: 3, 
      },
      {
          name: 'role',
          labelKey: 'role',
          type: 'select' as const, 
          widthMultiplier: 1.0,
          options: roles,
      }
  ];

  const renderCustomFields = (formikProps: FormikProps<IStudentFormValues>) => (
    <View style={styles.customFieldContainer} key="scd-selector-container">
        {/* SCDSelector is assumed to be defined in 'ui-component/SCDSelector' */}
        <SCDSelector
            formik={{
                values: formikProps.values,
                setFieldValue: formikProps.setFieldValue,
                touched: formikProps.touched,
                errors: formikProps.errors,
                schoolLabel: t('student:fields.school'),
                classLabel: t('student:fields.class'),
                divisionLabel: t('student:fields.division')
            }}
        />
    </View>
  );

  const tabs = [
    { labelKey: 'details', index: 0 },
    { labelKey: 'documents', index: 1 },
  ];

  return (
    <View style={styles.screenContainer}>
      <MainCard title={Title}> 
        <Toaster position="top-right" reverseOrder={false} />
        
        <RNTabs 
            value={tabValue} 
            onChange={handleTabChange} 
            tabs={tabs} 
            tNamespace="student" 
        />

        <RNTabPanel value={tabValue} index={0}>
          <ReusableForm<IStudentFormValues>
            initialValues={studentData}
            validationSchema={StudentValidationSchema}
            onSubmit={handleSubmit}
            fields={standardFields}
            isEditMode={isEditMode}
            cancelAction={handleCancel}
            tNamespace="student"
            renderCustomContent={renderCustomFields} 
          />
        </RNTabPanel>
        
        <RNTabPanel value={tabValue} index={1}>
          {userId ? (
            <UserDocumentManager userId={userId} userType="STUDENT" />
          ) : (
             <Text style={styles.infoText}>{t('student:messages.saveFirstForDocuments')}</Text>
          )}
        </RNTabPanel>

      </MainCard>
    </View>
  );
};


// ====================================================================================
// 4. Styles
// ====================================================================================

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
    },
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: colors.divider,
        backgroundColor: colors.card,
        paddingHorizontal: 16,
    },
    tab: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginRight: 10,
        borderBottomWidth: 2,
        borderColor: 'transparent',
    },
    activeTab: {
        borderColor: colors.primary,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text,
    },
    activeTabText: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    tabContent: {
        flex: 1,
        backgroundColor: colors.background,
    },
    infoText: {
        padding: 16,
        fontSize: 16,
        color: colors.text,
    },
    customFieldContainer: {
        width: '100%', 
        paddingHorizontal: 8,
        marginBottom: 16,
    }
});

// Since the error message suggests a component import error within AddEditStudent (which refers to this file), 
// ensure the default export matches the intended usage.
export default EditStudent;
