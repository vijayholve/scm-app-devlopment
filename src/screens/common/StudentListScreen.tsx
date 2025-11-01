// Example usage in a screen (e.g., app/src/screens/admin/StudentsScreen.tsx)

import React from 'react';
import { View, StyleSheet } from 'react-native';
import ReusableDataGrid from '../../components/common/ReusableDataGrid';
import { Chip, Text } from 'react-native-paper'; // Import any necessary components for custom rendering

const StudentListScreen: React.FC = () => {
  // 1. Define the columns
  const studentColumns = [
    { key: 'rollNumber', header: 'Roll No.' },
    { key: 'fullName', header: 'Student Name' },
    { 
        key: 'className', 
        header: 'Class',
        // Example of a custom renderer to display data visually
        renderCell: (item) => <Chip style={{ backgroundColor: '#2196F3' }} textStyle={{ color: 'white' }}>{item.className}</Chip> 
    },
    { key: 'email', header: 'Email' },
    { 
      key: 'actions', 
      header: 'Actions', 
      isAction: true, // This column will automatically render Edit/Delete buttons
    },
  ];

  return (
    <View style={{ flex: 1 }}>
      <ReusableDataGrid
        title="Student Master"
        columns={studentColumns}
        fetchUrl="/api/students" // API endpoint for fetching data (e.g., GET /api/students?page=1&limit=10)
        deleteUrl="/api/students/" // API endpoint prefix for deletion (e.g., DELETE /api/students/ITEM_ID)
        addRoute="AdminStudentAdd" // Name of the React Navigation route for the add/create screen
        editRoute="AdminStudentEdit" // Name of the React Navigation route for the edit screen
        // initialFilters={{ classId: '5f9f1b9b9c9d9c0000a1b3a1' }} // Optional filter to restrict the initial list
      />
    </View>
  );
};

export default StudentListScreen;