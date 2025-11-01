

const endpoints = {
  auth: {
    login: 'api/users/login',
    refresh: 'api/auth/refresh',
    forgotPasswordRequest: 'api/auth/forgot-password-request',
    resetPassword: 'api/auth/reset-password'
  },
  users: {
    base: 'api/users',
    getAllByType: 'api/users/getAllBy',
    delete: 'api/users/delete'
  },
  roles: {
    base: 'api/roles',
    getAll: 'api/roles/getAll',
    save: 'api/roles/save',
    update: 'api/roles/update',
    delete: 'api/roles/delete'
  },
  schools: {
    branches: {
      getAll: 'api/schoolBranches/getAll',
      delete: 'api/schoolBranches/delete'
    },
    classes: {
      getAll: 'api/schoolClasses/getAll',
      delete: 'api/schoolClasses/delete'
    },
    divisions: {
      getAll: 'api/divisions/getAll',
      delete: 'api/devisions/delete'
    },
    subjects: {
      getAll: 'api/subjects/getAll',
      delete: 'api/subjects/delete'
    }
  },
  institutes: {
    getAll: 'api/institutes/getAll',
    delete: 'api/institutes/delete'
  },
  attendance: {
    save: 'api/attendance/save',
    delete: 'api/attendance/delete'
  },
  timetable: {
    base: 'api/timetable',
    delete: 'api/timetable/delete'
  },
  exams: {
    base: 'api/exams',
    create: 'api/exams/create',
    delete: 'api/exams/delete'
  },
  assignments: {
    base: 'api/assignments',
    submit: 'api/assignments/submit',
    delete: 'api/assignments/delete'
  },
  lms: {
    course: {
      getAll: '/api/lms/course/getAll',
      getById: '/api/lms/courses',
      enrollment: {
        status: '/api/lms/courses', // Usage: `${endpoints.lms.courses.enrollment.status}/${accountId}/${courseId}/enroll/${studentId}/status`
        enroll: '/api/lms/courses' // Usage: `${endpoints.lms.courses.enrollment.enroll}/${accountId}/${courseId}/enroll`
      },
      save: 'api/lms/course/save',
      delete: 'api/lms/course/delete'
    }
  },
  quiz: {
    base: 'api/quiz',
    delete: 'api/quiz/delete',
    studentAnswerSubmit: 'api/studentanswer/submit'
  },
  fees: {
    admin: {
      structure: 'api/admin/fees/structure',
      delete: 'api/admin/fees/delete'
    }
  },
  documents: {
    delete: 'api/documents/delete'
  },
  students: {
    sampleExcel: 'api/students/download-sample-excel',
    bulkUpload: 'api/students/bulk-upload'
  },
  notifications: {
    // New endpoints for notifications
    create: 'api/notifications',
    search: 'api/notifications/search',
    getById: 'api/notifications/getById',
    update: 'api/notifications/update',
    delete: 'api/notifications/delete',
    getByUser: 'api/notifications/user',
    getActive: 'api/notifications/active'
  },
  accounts: {
    getAll: '/api/accounts/getAll' // Replace with the actual endpoint
  },
  features: {
    getAllByAccountId: '/api/features/getAllByAccountId'
  }
};

// Add documentation endpoints if needed (optional)
export const documentation = {
  masters: '/api/documentation/masters',
  help: '/api/documentation/help'
};

export default endpoints;
