import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { Card, Text, Button, FAB, Searchbar, Chip } from "react-native-paper";
import { apiService } from "../../api/apiService";
import { Teacher } from "../../types";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { storage } from "../../utils/storage";

export const TeachersScreen: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = teachers.filter(
        (t) =>
          t.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTeachers(filtered);
    } else {
      setFilteredTeachers(teachers);
    }
  }, [searchQuery, teachers]);

  const loadTeachers = async () => {
    try {
      const raw = await storage.getItem("SCM-AUTH");
      const accountId = raw
        ? JSON.parse(raw)?.data?.accountId ?? undefined
        : undefined;
      const data = await apiService.getTeachers(accountId);
      setTeachers(data);
      setFilteredTeachers(data);
    } catch (error) {
      console.error("Failed to load teachers:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadTeachers();
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteTeacher(id);
      loadTeachers();
    } catch (error) {
      console.error("Failed to delete teacher:", error);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search teachers..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredTeachers.map((teacher) => (
          <Card key={teacher.id} style={styles.card}>
            <Card.Content>
              <View style={styles.header}>
                <View>
                  <Text variant="titleLarge">
                    {teacher.firstName} {teacher.lastName}
                  </Text>
                  <Text variant="bodyMedium" style={styles.email}>
                    {teacher.email}
                  </Text>
                </View>
                <Chip>{teacher.subject}</Chip>
              </View>

              <View style={styles.details}>
                <Text variant="bodySmall">Phone: {teacher.phone}</Text>
                <Text variant="bodySmall">
                  Classes Assigned: {teacher?.classAssigned?.length}
                </Text>
              </View>

              <View style={styles.actions}>
                <Button
                  mode="outlined"
                  onPress={() => console.log("Edit", teacher.id)}
                >
                  Edit
                </Button>
                <Button
                  mode="text"
                  textColor="red"
                  onPress={() => handleDelete(teacher.id)}
                >
                  Delete
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}

        {filteredTeachers.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge">No teachers found</Text>
          </View>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => console.log("Add teacher")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  searchbar: {
    margin: 16,
    elevation: 2,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  email: {
    color: "#666",
  },
  details: {
    marginBottom: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#6200ee",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
  },
});
