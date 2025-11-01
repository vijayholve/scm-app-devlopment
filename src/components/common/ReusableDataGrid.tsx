import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Portal,
  Dialog,
  Searchbar,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import api from '../../api';
import { storage } from '../../utils/storage';
import { LoadingSpinner } from './LoadingSpinner';

interface Column {
  key: string;
  header: string;
  renderCell?: (item: any) => React.ReactNode;
}

interface ReusableDataGridProps {
  title: string;
  fetchUrl?: string;
  columns: Column[];
  addActionUrl?: string;
  editUrl?: string;
  deleteUrl?: string;
  entityName?: string;
  searchPlaceholder?: string;
  transformData?: (data: any) => any;
  isPostRequest?: boolean;
  requestMethod?: 'GET' | 'POST';
  filters?: object;
  clientSideData?: any[];
  onDataChange?: (data: any[]) => void;
  defaultPageSize?: number;
  sortBy?: string;
}

export const ReusableDataGrid: React.FC<ReusableDataGridProps> = ({
  title,
  fetchUrl,
  columns,
  addActionUrl,
  editUrl,
  deleteUrl,
  entityName,
  searchPlaceholder = 'Search...',
  transformData,
  isPostRequest = true,
  requestMethod,
  filters = {},
  clientSideData = [],
  onDataChange,
  defaultPageSize = 10,
  sortBy = 'asc',
}) => {
  const navigation = useNavigation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: defaultPageSize });
  const [rowCount, setRowCount] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [gridFilters, setGridFilters] = useState(filters);
  const [gridData, setGridData] = useState([]);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [isDeleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const latestFilters = useRef(gridFilters);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    const fetchUser = async () => {
      const raw = await storage.getItem("SCM-AUTH");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed?.data?.user || parsed?.data);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    latestFilters.current = gridFilters;
  }, [gridFilters]);

  const isStudent = user?.type === 'STUDENT';
  const isTeacher = user?.type === 'TEACHER';
  const isAdmin = user?.type === 'ADMIN';
  const teacherSchoolId = user?.schoolId ?? null;

  const fetchData = useCallback(async () => {
    if (!fetchUrl) {
      const filteredData = clientSideData.filter((item) => {
        let isMatch = true;
        if (latestFilters.current.schoolId) {
          isMatch = isMatch && item.schoolId == latestFilters.current.schoolId;
        }
        if (latestFilters.current.classId) {
          isMatch = isMatch && item.classId == latestFilters.current.classId;
        }
        if (latestFilters.current.divisionId) {
          isMatch = isMatch && item.divisionId == latestFilters.current.divisionId;
        }
        if (searchText) {
          isMatch = isMatch && JSON.stringify(item).toLowerCase().includes(searchText.toLowerCase());
        }
        return isMatch;
      });
      const transformed = transformData ? filteredData.map(transformData) : filteredData;
      setGridData(transformed);
      setRowCount(transformed.length);
      if (onDataChange) onDataChange(transformed);
      return;
    }

    setLoading(true);
    try {
      let response;
      const method = (requestMethod || (isPostRequest ? 'POST' : 'GET')).toUpperCase();
      const enforcedFilters: any = {};

      if (isStudent) {
        if (user.schoolId) enforcedFilters.schoolId = user.schoolId;
        if (user.classId) enforcedFilters.classId = user.classId;
        if (user.divisionId) enforcedFilters.divisionId = user.divisionId;
      }

      let teacherClassList = [];
      let teacherDivisionList = [];
      if (isTeacher && Array.isArray(user?.allocatedClasses)) {
        teacherClassList = Array.from(new Set(user.allocatedClasses.map((ac: any) => ac.classId).filter(Boolean)));
        teacherDivisionList = Array.from(new Set(user.allocatedClasses.map((ac: any) => ac.divisionId).filter(Boolean)));
        if (teacherSchoolId != null) enforcedFilters.schoolId = teacherSchoolId;
      }

      const uiFilters: any = {};
      if (!(isAdmin && isInitialLoadRef.current)) {
        Object.assign(uiFilters, latestFilters.current);
      }

      const basePayload = {
        page: paginationModel.page,
        size: paginationModel.pageSize,
        sortBy: 'id',
        sortDir: sortBy,
        search: searchText
      };

      const payload = { ...basePayload, ...uiFilters, ...enforcedFilters };

      if (uiFilters.classId || uiFilters.divisionId) {
        delete payload.classList;
        delete payload.divisionList;
      } else if (isTeacher) {
        if (teacherClassList.length) payload.classList = teacherClassList;
        if (teacherDivisionList.length) payload.divisionList = teacherDivisionList;
      }

      if (method === 'POST') {
        response = await api.post(fetchUrl, payload);
      } else {
        response = await api.get(fetchUrl, { params: payload });
      }

      const responseData = response.data?.content || response.data?.data || response.data || [];
      const transformed = transformData ? responseData.map(transformData) : responseData;
      setGridData(transformed);
      setRowCount(response.data?.totalElements || responseData.length || 0);
      if (onDataChange) onDataChange(transformed);

    } catch (err: any) {
      console.error(`Failed to fetch data from ${fetchUrl}:`, err);
      Alert.alert('Fetch Error', err.message || 'An unexpected error occurred.');
      setGridData([]);
      setRowCount(0);
    } finally {
      setLoading(false);
      if (isInitialLoadRef.current) isInitialLoadRef.current = false;
    }
  }, [
    fetchUrl, isPostRequest, requestMethod, searchText, transformData,
    clientSideData, paginationModel, isAdmin, isStudent, isTeacher, sortBy,
    teacherSchoolId, user, onDataChange
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  };

  const handleAdd = () => addActionUrl && navigation.navigate(addActionUrl as never);
  const handleEdit = (item: any) => editUrl && navigation.navigate(`${editUrl}/${item.id}` as never);
  const showDeleteDialog = (id: string) => {
    setDeleteItemId(id);
    setDeleteDialogVisible(true);
  };
  const hideDeleteDialog = () => setDeleteDialogVisible(false);

  const handleDelete = async () => {
    if (deleteUrl && deleteItemId) {
      try {
        await api.post(deleteUrl, { id: deleteItemId });
        Alert.alert('Success', `${entityName} deleted successfully.`);
        fetchData();
      } catch (error: any) {
        Alert.alert('Delete Error', error.message || 'Failed to delete item.');
      } finally {
        hideDeleteDialog();
      }
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <Card style={styles.card}>
        <Card.Content>
            {columns.map((col) => (
                <View key={col.key} style={styles.row}>
                    <Text variant="labelLarge" style={styles.headerText}>{col.header}</Text>
                    {col.renderCell ? col.renderCell(item) : <Text style={styles.valueText}>{item[col.key]}</Text>}
                </View>
            ))}
            <View style={styles.actions}>
                {editUrl && <Button mode="outlined" onPress={() => handleEdit(item)}>Edit</Button>}
                {deleteUrl && <Button mode="text" textColor="red" onPress={() => showDeleteDialog(item.id)}>Delete</Button>}
            </View>
        </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
        <View style={styles.headerContainer}>
            <Text variant="headlineSmall">{title}</Text>
            {addActionUrl && (
                <Button icon="plus" mode="contained" onPress={handleAdd}>
                    {`Add ${entityName || ''}`}
                </Button>
            )}
        </View>
      <Searchbar
        placeholder={searchPlaceholder}
        onChangeText={setSearchText}
        value={searchText}
        style={styles.searchbar}
        onIconPress={fetchData}
      />
      {loading && !refreshing ? <LoadingSpinner /> : (
        <FlatList
          data={gridData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<View style={styles.emptyContainer}><Text>No {entityName} found.</Text></View>}
          ListFooterComponent={() => (
            <View style={styles.pagination}>
              <Button disabled={paginationModel.page === 0} onPress={() => setPaginationModel(p => ({...p, page: p.page - 1}))}>Previous</Button>
              <Text>Page {paginationModel.page + 1}</Text>
              <Button disabled={(paginationModel.page + 1) * paginationModel.pageSize >= rowCount} onPress={() => setPaginationModel(p => ({...p, page: p.page + 1}))}>Next</Button>
            </View>
          )}
        />
      )}
      <Portal>
        <Dialog visible={isDeleteDialogVisible} onDismiss={hideDeleteDialog}>
          <Dialog.Title>Confirm Delete</Dialog.Title>
          <Dialog.Content><Text>Are you sure you want to delete this {entityName}?</Text></Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDeleteDialog}>Cancel</Button>
            <Button onPress={handleDelete} textColor="red">Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};





const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchbar: { margin: 8 },
  listContainer: { paddingHorizontal: 8, paddingBottom: 60 },
  card: { marginVertical: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, alignItems: 'center' },
  headerText: { flex: 1, fontWeight: 'bold' },
  valueText: { flex: 2, textAlign: 'right' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, gap: 8 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  pagination: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', padding: 16 },
});
