import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, Chip, Portal, Modal, FAB, Snackbar } from 'react-native-paper';
import { ReusableList } from '../../../components/ReusableList';
import { apiService } from '../../../api/apiService';
import { storage } from '../../../utils/storage';
import { Student } from '../../../types';
import EditStudent from './EditStudent';
import StudentView from './StudentView';

export const StudentList: React.FC = () => {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [schools, setSchools] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [toast, setToast] = useState<string>('');

  useEffect(() => {
    const init = async () => {
      const raw = await storage.getItem('SCM-AUTH');
      const acc = raw ? JSON.parse(raw)?.data?.accountId : null;
      setAccountId(acc);
      if (acc) {
        const [s, c, d] = await Promise.all([
          apiService.getSchools(acc),
          apiService.getClassesList(acc),
          apiService.getDivisions(acc),
        ]);
        setSchools(s);
        setClasses(c);
        setDivisions(d);
      }
    };
    init();
  }, []);

  const filterDefs = useMemo(() => {
    return [
      { key: 'schoolId', label: 'School', options: schools.map((x) => ({ label: x.name, value: String(x.id) })) },
      { key: 'classId', label: 'Class', options: classes.map((x) => ({ label: x.name, value: String(x.id) })) },
      { key: 'divisionId', label: 'Division', options: divisions.map((x) => ({ label: x.name, value: String(x.id) })) },
    ];
  }, [schools, classes, divisions]);

  const onFetch = async ({ page, size, search, filters }: any) => {
    const res = await apiService.getStudentsPaged({
      accountId: accountId || '',
      page,
      size,
      search,
      schoolId: filters.schoolId,
      classId: filters.classId,
      divisionId: filters.divisionId,
    });
    return res;
  };

  const renderItem = (student: Student) => (
    <Card key={student.id} style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View>
            <Text variant="titleLarge">{student.firstName} {student.lastName}</Text>
            <Text variant="bodyMedium" style={styles.email}>{student.email}</Text>
          </View>
          <Chip>Roll: {student.rollNumber || (student as any).rollNo || ''}</Chip>
        </View>

        <View style={styles.actions}>
          <Button mode="text" onPress={() => { setViewId(student.id); setShowView(true); }}>View</Button>
          <Button mode="outlined" onPress={() => { setEditId(student.id); setShowEdit(true); }}>Edit</Button>
          <Button mode="text" textColor="red" onPress={() => handleDelete(student.id)}>Delete</Button>
        </View>
      </Card.Content>
    </Card>
  );

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteStudent(id);
      setToast('Deleted');
    } catch (e) {
      setToast('Delete failed');
    }
  };

  return (
    <View style={styles.container}>
      <ReusableList<Student>
        filterDefs={filterDefs}
        onFetch={onFetch}
        renderItem={renderItem}
        headerRight={<View />}
      />

      <FAB style={styles.fab} icon="plus" onPress={() => { setEditId(null); setShowEdit(true); }} />

      <Portal>
        <Modal visible={showEdit} onDismiss={() => setShowEdit(false)} contentContainerStyle={styles.modal}>
          <EditStudent id={editId} onClose={() => setShowEdit(false)} onSaved={() => { setShowEdit(false); setToast('Saved'); }} />
        </Modal>
        <Modal visible={showView} onDismiss={() => setShowView(false)} contentContainerStyle={styles.modal}>
          {viewId && <StudentView id={viewId} />}
        </Modal>
      </Portal>

      <Snackbar visible={!!toast} onDismiss={() => setToast('')} duration={2000}>{toast}</Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  email: {
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#6200ee',
  },
  modal: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 8,
    maxHeight: '90%'
  },
});

export default StudentList;


