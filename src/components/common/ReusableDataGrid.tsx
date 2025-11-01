// app/src/components/common/ReusableDataGrid.tsx

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import {
  Card,
  Text,
  Button,
  ActivityIndicator,
  IconButton,
  Portal,
  Dialog,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
// Assuming 'api' is the axios client instance exported from your utility file
import { api } from "../../utils/apiService";
import { LoadingSpinner } from "./LoadingSpinner";

// --- TYPES ---

interface Column {
  key: string; // Key in the data object (must match API field name)
  header: string; // Displayed label for the column
  renderCell?: (item: any) => React.ReactNode; // Custom renderer for cell content
  isAction?: boolean; // If true, this column contains action buttons (Edit/Delete)
}

interface DataGridProps {
  title: string;
  columns: Column[];
  fetchUrl: string; // API endpoint for fetching data (e.g., '/api/students')
  deleteUrl?: string; // API endpoint prefix for deleting (e.g., '/api/students/')
  addRoute?: string; // Name of the React Navigation route for the Add/Create screen
  editRoute?: string; // Name of the React Navigation route for the Edit screen
  initialFilters?: Record<string, any>; // Optional filters to send with fetch API
  pageSize?: number;
}

// --- CONSTANTS ---
const PAGE_SIZE = 10;

const ReusableDataGrid: React.FC<DataGridProps> = ({
  title,
  columns,
  fetchUrl,
  deleteUrl,
  addRoute,
  editRoute,
  initialFilters = {},
  pageSize = PAGE_SIZE,
}) => {
  const navigation = useNavigation();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  // Function to fetch data from the API
  const fetchData = useCallback(
    async (pageToFetch: number, isRefreshing = false) => {
      // Prevent fetching if already at the last page and not refreshing
      if (pageToFetch > totalPages && !isRefreshing) return;

      if (isRefreshing || pageToFetch === 1) {
        setLoading(true);
        setError(null);
      } else {
        setRefreshing(true); // Use refreshing state for subsequent page loads via scroll
      }

      try {
        const params = {
          page: pageToFetch,
          limit: pageSize,
          ...initialFilters,
          // TODO: Add search/sort parameters to 'params' here if implementing search
        };

        const response = await api.get(fetchUrl, { params });

        // Assuming API response format: { data: [], totalPages: 1, currentPage: 1 }
        const newItems = response.data?.data || [];
        const totalPagesFromApi = response.data?.totalPages || 1;

        setData((prevData) => {
          if (isRefreshing || pageToFetch === 1) {
            return newItems; // Replace data on initial load or refresh
          } else {
            return [...prevData, ...newItems]; // Append data for load more
          }
        });
        setTotalPages(totalPagesFromApi);
        setPage(pageToFetch);
      } catch (err: any) {
        console.error("Data Fetch Error:", err.response?.data || err.message);
        const errorMessage =
          err.response?.data?.message || "Failed to fetch data.";
        setError(errorMessage);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [fetchUrl, pageSize, initialFilters, totalPages]
  );

  // Initial load effect
  useEffect(() => {
    fetchData(1, true);
  }, [fetchUrl]); // Re-fetch when URL or filters change

  // Load more data when scrolling to the end
  const handleLoadMore = () => {
    if (!loading && !refreshing && page < totalPages) {
      fetchData(page + 1);
    }
  };

  // Handle Refresh from pull-to-refresh
  const handleRefresh = () => {
    fetchData(1, true);
  };

  // --- CRUD HANDLERS ---
  const handleEdit = (item: any) => {
    if (editRoute) {
      // Pass the item data to the edit screen
      navigation.navigate(
        editRoute as never,
        { id: item._id, data: item } as never
      );
    } else {
      Alert.alert(
        "Configuration Error",
        "Edit route not configured for this data grid."
      );
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete || !deleteUrl) {
      setShowDeleteDialog(false);
      return;
    }

    setLoading(true);
    setShowDeleteDialog(false);

    try {
      // Construct the full delete URL (e.g., /api/students/12345)
      await api.delete(`${deleteUrl}${itemToDelete._id}`);

      // Refresh data after successful deletion
      Alert.alert("Success", `${title.slice(0, -1)} deleted successfully.`);
      fetchData(1, true);
    } catch (err: any) {
      console.error("Delete Error:", err.response?.data || err.message);
      const errorMessage =
        err.response?.data?.message ||
        `Failed to delete ${title.slice(0, -1)}.`;
      Alert.alert("Error", errorMessage);
      setLoading(false);
    } finally {
      setItemToDelete(null);
    }
  };

  const handleOpenDeleteDialog = (item: any) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };

  // --- RENDERERS ---

  // Custom component for each row/card
  const renderItem = ({ item }: { item: any }) => (
    // Card onPress can also trigger edit/view if an editRoute is provided
    <Card style={styles.card} onPress={() => editRoute && handleEdit(item)}>
      <Card.Content>
        {columns.map((column, index) => (
          // Use two-column layout for mobile: Header/Label on left, Value/Actions on right
          <View key={column.key} style={styles.row}>
            <Text style={styles.headerText}>{column.header}:</Text>

            <View style={styles.valueContainer}>
              {column.isAction ? (
                // Render Action Buttons
                <View style={styles.actionsContainer}>
                  {/* Default Edit Action */}
                  {editRoute && (
                    <IconButton
                      icon="pencil"
                      size={20}
                      onPress={() => handleEdit(item)}
                    />
                  )}
                  {/* Default Delete Action */}
                  {deleteUrl && (
                    <IconButton
                      icon="delete"
                      size={20}
                      onPress={() => handleOpenDeleteDialog(item)}
                    />
                  )}
                  {/* Custom renderCell for the action column can add more buttons */}
                  {column.renderCell && column.renderCell(item)}
                </View>
              ) : // Render Data Cell
              column.renderCell ? (
                column.renderCell(item) // Use custom renderer if provided
              ) : (
                <Text>
                  {item[column.key] ? String(item[column.key]) : "N/A"}
                </Text>
              )}
            </View>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  // Render Footer for FlatList (loading indicator/error/end of list)
  const renderFooter = () => {
    if (loading && data.length === 0) return null; // Handled by main loading spinner

    // Only show scroll loading indicator if fetching next page
    if (refreshing)
      return <ActivityIndicator style={styles.loader} size="small" />;

    if (error && data.length > 0) {
      // Show inline error below existing data
      return <Text style={styles.errorText}>Data loading error: {error}</Text>;
    }

    if (page >= totalPages && data.length > 0) {
      return (
        <Text style={styles.endOfListText}>--- End of {title} List ---</Text>
      );
    }

    return null;
  };

  // --- MAIN RENDER LOGIC ---

  if (loading && data.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {addRoute && (
          <Button
            mode="contained"
            icon="plus"
            onPress={() => navigation.navigate(addRoute as never)}
            style={styles.addButton}
          >
            Add
          </Button>
        )}
      </View>

      {data.length === 0 && !loading && !error ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No {title} found.</Text>
          <Button mode="outlined" onPress={handleRefresh}>
            Reload
          </Button>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) =>
            item._id || item.id || Math.random().toString()
          } // Ensure unique key
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing && page === 1}
              onRefresh={handleRefresh}
            />
          }
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={showDeleteDialog}
          onDismiss={() => setShowDeleteDialog(false)}
        >
          <Dialog.Title>Confirm Deletion</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete this record?</Text>
            {loading && <ActivityIndicator style={{ marginTop: 10 }} />}
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setShowDeleteDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onPress={handleDelete} loading={loading}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

// --- STYLES ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  addButton: {
    //
  },
  listContent: {
    padding: 10,
  },
  card: {
    marginBottom: 10,
    elevation: 2, // Shadow for Android
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerText: {
    fontWeight: "bold",
    color: "#333",
    width: "40%", // Label space
    fontSize: 14,
  },
  valueContainer: {
    width: "60%", // Value space
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  actionsContainer: {
    flexDirection: "row",
  },
  loader: {
    marginVertical: 20,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  endOfListText: {
    textAlign: "center",
    color: "#999",
    marginVertical: 20,
    fontStyle: "italic",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 10,
    color: "#666",
  },
});

export default ReusableDataGrid;
