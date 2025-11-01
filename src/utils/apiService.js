import axios from 'axios';
import { Alert } from 'react-native'; // Use Alert for toast-like messages in RN
// import AsyncStorage from '@react-native-async-storage/async-storage'; // You MUST install and import this package

// Placeholder for AsyncStorage functions.
// Replace with actual implementation from your chosen storage solution (e.g., AsyncStorage)
const storage = {
  getItem: async (key) => {
    // return await AsyncStorage.getItem(key); // Use this line in your project
    return Promise.resolve(null); // Placeholder: Replace with actual async storage logic
  },
  removeItem: async (key) => {
    // await AsyncStorage.removeItem(key); // Use this line in your project
    return Promise.resolve(); // Placeholder
  }
};

/**
 * 🔐 Asynchronously retrieves and parses authentication data from storage.
 * Handles parsing errors by clearing storage.
 * @returns {Promise<Object | null>} The parsed auth data or null.
 */
const getAuthData = async () => {
  try {
    const authDataString = await storage.getItem('SCM-AUTH');
    return authDataString ? JSON.parse(authDataString) : null;
  } catch (error) {
    console.error('Failed to parse auth data from storage:', error);
    await storage.removeItem('SCM-AUTH');
    return null;
  }
};

// --- ⚙️ Axios Client Configuration ---
const apiClient = axios.create({
  // Note: import.meta.env is a Vite-specific feature. In React Native, 
  // you might use a similar setup via react-native-dotenv or a manual config file.
  // Replace with your RN environment variable setup.
  baseURL: 'https://scm-production-8ceb.up.railway.app', 
  headers: {
    'Content-Type': 'application/json'
  }
});

// --- ⚙️ Axios Interceptors (Request) ---
apiClient.interceptors.request.use(
  async (config) => { // Must be async now
    const authData = await getAuthData();
    const token = authData?.accessToken;
    const userId = authData?.data?.id;
    const username = authData?.data?.userName;
    console.log('Request made by user:', username);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (userId) {
      // 📝 Handling POST/PUT/PATCH data
      if (config.method === 'post') {
        config.data = {
          ...config.data,
          createdBy: userId,
          updatedBy: userId
        };
      } else if (config.method === 'put' || config.method === 'patch') {
        // Note: You were setting updatedBy to 'username' in the original PUT/PATCH handler, 
        // but 'userId' for POST. I've kept 'username' for consistency with your original intent, 
        // but often 'updatedBy' expects an ID. Verify with your backend.
        config.data = {
          ...config.data, 
          updatedBy: username // Changed from username to userId if the backend expects an ID
        };
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- 👤 User Details Helper (Must be ASYNC) ---
// Since getAuthData is now async, all helper methods using it must also be async or return a promise.
export const userDetails = {
  getUser: async () => (await getAuthData())?.data || null,
  getAccountId: async () => (await getAuthData())?.data?.accountId || null,
  getPermissions: async () => (await getAuthData())?.data?.role?.permissions || [],
  getUserType: async () => (await getAuthData())?.data?.type || 'GUEST',
  isLoggedIn: async () => !!(await getAuthData())?.accessToken
};

// --- 📝 User School/Class/Division Helper (Must be ASYNC) ---
export const getUserSchoolClassDivision = async () => {
  const user = await userDetails.getUser();
  console.log('User Details:', user);
  if (user?.type === 'STUDENT') {
    return {
      schoolId: user.schoolId || null,
      classId: user.classId || null,
      divisionId: user.divisionId || null
    };
  }
  return {
    schoolId: null,
    classId: null,
    divisionId: null
  };
};

// --- ⚙️ Axios Interceptors (Response) ---
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // ⚠️ Replaced react-hot-toast with React Native's Alert
      Alert.alert('Session Expired', 'Please log in again.', [
        { 
          text: 'OK', 
          onPress: () => {
            // In a real RN app, you'd dispatch an action to clear auth state 
            // and navigate to the Login screen via your navigation library (e.g., React Navigation).
            console.log('Redirect to login logic here...'); 
          }
        }
      ]);
    }
    return Promise.reject(error);
  }
);

// --- 🎂 API Call: Get Today's Birthdays ---
export const getTodayBirthdays = async () => {
  const accountId = await userDetails.getAccountId(); // Await helper function
  const user = await userDetails.getUser(); // Await helper function
  const schoolId = user?.schoolId;

  if (!accountId) {
    console.error('Account ID not available for fetching birthdays.');
    return [];
  }
  
  let url = `/api/users/birthdays/today/1`;
  if (schoolId) {
      url += `?schoolId=${schoolId}`;
  }
  
  try {
    const response = await apiClient.get(url);
    return response.data?.content || response.data || []; 
  } catch (error) {
    console.error("Failed to fetch today's birthdays:", error);
    return [];
  }
};

// --- 📂 NEW: Document Helpers ---
export const getDocumentsByAccountAndUser = (accountId, userId) => {
  return apiClient.get(`/api/documents/${accountId}/${userId}`);
};

export const downloadUserDocument = (accountId, userId, documentId) => {
  // Use 'blob' for responseType to handle file download in a cross-platform way.
  // In React Native, you will need to use a library like 'rn-fetch-blob' 
  // or 'react-native-fs' to save the downloaded blob data to the device's storage.
  return apiClient.get(`/api/documents/download/${accountId}/${userId}/${documentId}`, { responseType: 'blob' });
};

// --- 🎓 Course Enrollment Helpers ---
export const checkCourseEnrollmentStatus = async (accountId, courseId, studentId) => {
  try {
    const response = await apiClient.get(`/api/lms/courses/${accountId}/${courseId}/enroll/${studentId}/status`);
    return response.data;
  } catch (error) {
    console.error(`Failed to check enrollment for course ${courseId}:`, error);
    return { enrolled: false };
  }
};

export const checkMultipleCourseEnrollments = async (accountId, courseIds, studentId) => {
  try {
    const enrollmentChecks = courseIds.map((courseId) => checkCourseEnrollmentStatus(accountId, courseId, studentId));

    const results = await Promise.all(enrollmentChecks);

    return courseIds
      .map((courseId, index) => ({
        courseId,
        enrollmentStatus: results[index]
      }))
      .filter((result) => result.enrollmentStatus.enrolled);
  } catch (error) {
    console.error('Failed to check multiple course enrollments:', error);
    return [];
  }
};

// --- Exported API Client and Alias ---
export const api = apiClient;

// --- Default export ---
export default apiClient;