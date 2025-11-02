import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ReusableDataGrid } from '../../../components/common/ReusableDataGrid';
import { storage } from '../../../utils/storage';

const columnsConfig = [
  { key: 'rollNo', header: 'Roll No' },
  { key: 'userName', header: 'User Name' },
  { key: 'firstName', header: 'First Name' },
  { key: 'lastName', header: 'Last Name' },
  { key: 'email', header: 'Email' },
  { key: 'mobile', header: 'Mobile' },
  { key: 'schoolName', header: 'School' },
  { key: 'className', header: 'Class' },
  { key: 'divisionName', header: 'Division' },
];

const transformStudentData = (student: any) => ({
  ...student,
  rollno: student.rollNo || student.id,
  name: `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.userName,
  schoolName: student.school?.name || 'N/A',
  className: student.class?.name || 'N/A',
  divisionName: student.division?.name || 'N/A',
});

export const StudentList: React.FC = () => {
  const [fetchUrl, setFetchUrl] = useState('');

  useEffect(() => {
    const initialize = async () => {
      const raw = await storage.getItem("SCM-AUTH");
      const accountId = raw ? JSON.parse(raw)?.data?.accountId : undefined;
      if (accountId) {
        setFetchUrl(`/api/users/getAllBy/${accountId}?type=STUDENT`);
      }
    };
    initialize();
  }, []);

  if (!fetchUrl) {
    return null; // Or a loading indicator
  }

  return (
    <View style={styles.container}>
      <ReusableDataGrid
        title="Students"
        fetchUrl={fetchUrl}
        columns={columnsConfig}
        isPostRequest={true}
        addActionUrl="AddStudent"
        editUrl="EditStudent"
        deleteUrl="/api/users/delete"
        entityName="Student"
        searchPlaceholder="Search students..."
        transformData={transformStudentData}
        
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default StudentList;
