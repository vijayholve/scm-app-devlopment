import api, { endpoints } from "./index";
import { Student, Teacher, Assignment, Class } from "../types";

class ApiService {
  async getStudentsPaged(params: {
    accountId: string;
    page?: number;
    size?: number;
    search?: string;
    schoolId?: string;
    classId?: string;
    divisionId?: string;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  }): Promise<{ items: Student[]; total: number }> {
    const { accountId, page = 0, size = 10, search = '', schoolId, classId, divisionId, sortBy = 'id', sortDir = 'asc' } = params;
    const url = `${endpoints.users.getAllByType}/${accountId}?type=STUDENT`;
    const payload = { page, size, sortBy, sortDir, search, schoolId, classId, divisionId };
    const res = await api.post(url, payload);
    const items = res.data?.content || res.data?.data || res.data || [];
    const total = res.data?.totalElements ?? items.length ?? 0;
    return { items, total };
  }

  async getStudents(accountId?: string): Promise<Student[]> {
    const res = await api.get(endpoints.users.getAllByType, { params: { type: 'STUDENT', accountId } });
    return res.data?.data || res.data || [];
  }

  async createStudent(payload: any): Promise<any> {
    const res = await api.post(endpoints.users.base, {
      ...payload,
      type: "STUDENT",
    });
    return res.data;
  }

  async updateStudent(id: string, payload: any): Promise<any> {
    const res = await api.put(`${endpoints.users.base}/${id}`, payload);
    return res.data;
  }

  async deleteStudent(id: string): Promise<void> {
    await api.post(endpoints.users.delete, { id });
  }

  async getTeachers(accountId?: string): Promise<Teacher[]> {
    const res = await api.get(`${endpoints.users.getAllByType}/${accountId}`, {
      params: { type: "TEACHER", accountId },
    });
    return res.data?.data || res.data || [];
  }

  async createTeacher(payload: any): Promise<any> {
    const res = await api.post(endpoints.users.base, {
      ...payload,
      type: "TEACHER",
    });
    return res.data;
  }

  async updateTeacher(id: string, payload: any): Promise<any> {
    const res = await api.put(`${endpoints.users.base}/${id}`, payload);
    return res.data;
  }

  async deleteTeacher(id: string): Promise<void> {
    await api.post(endpoints.users.delete, { id });
  }

  async getAssignments(params?: Record<string, any>): Promise<Assignment[]> {
    const res = await api.get(endpoints.assignments.base, { params });
    return res.data?.data || res.data || [];
  }

  async createAssignment(payload: any): Promise<any> {
    const res = await api.post(endpoints.assignments.base, payload);
    return res.data;
  }

  async updateAssignment(id: string, payload: any): Promise<any> {
    const res = await api.put(`${endpoints.assignments.base}/${id}`, payload);
    return res.data;
  }

  async deleteAssignment(id: string): Promise<void> {
    await api.post(endpoints.assignments.delete, { id });
  }

  async getClassById(id: string): Promise<Class> {
    const res = await api.get(`${endpoints.schools.classes.getAll}`, {
      params: { id },
    });
    return res.data?.data || res.data;
  }

  async getTimetableBy(accountId?: string, classId?: string): Promise<any> {
    const res = await api.get(endpoints.timetable.base, {
      params: { accountId, classId },
    });
    return res.data?.data || res.data;
  }

  async getRoles(accountId: string): Promise<any[]> {
    const url = `${endpoints.roles.getAll}/${accountId}`;
    const res = await api.post(url, { page: 0, size: 1000, sortBy: 'id', sortDir: 'asc', search: '' });
    return res.data?.content || [];
  }

  async getSchools(accountId: string): Promise<any[]> {
    const url = `${endpoints.schools.branches.getAll}/${accountId}`;
    const res = await api.post(url, { page: 0, size: 1000, sortBy: 'id', sortDir: 'asc', search: '' });
    return res.data?.content || [];
  }

  async getClassesList(accountId: string): Promise<any[]> {
    const url = `${endpoints.schools.classes.getAll}/${accountId}`;
    const res = await api.post(url, { page: 0, size: 1000, sortBy: 'id', sortDir: 'asc', search: '' });
    return res.data?.content || [];
  }

  async getDivisions(accountId: string): Promise<any[]> {
    const url = `${endpoints.schools.divisions.getAll}/${accountId}`;
    const res = await api.post(url, { page: 0, size: 1000, sortBy: 'id', sortDir: 'asc', search: '' });
    return res.data?.content || [];
  }

  async getStudentById(id: string): Promise<any> {
    const res = await api.get(`api/users/getById`, { params: { id } });
    return res.data;
  }

  async saveStudent(payload: any): Promise<any> {
    const res = await api.post(`api/users/save`, payload);
    return res.data;
  }

  async updateStudentFull(payload: any): Promise<any> {
    const res = await api.put(`api/users/update`, payload);
    return res.data;
  }
}

export const apiService = new ApiService();
