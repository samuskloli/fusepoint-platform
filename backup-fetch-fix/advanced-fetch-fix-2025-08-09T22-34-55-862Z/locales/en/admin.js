/**
 * English translations for administration
 */

export default {
  dashboard: {
    title: 'Administrator Dashboard',
    subtitle: 'Platform management and supervision',
    backToDashboard: 'Back to dashboard',
    totalUsers: 'Total users',
    activeUsers: 'Active users',
    agents: 'Agents',
    admins: 'Administrators',
    statistics: 'Statistics',
    userManagement: 'User management',
    platformSettings: 'Platform settings',
    systemLogs: 'System logs',
    overview: 'Overview',
    quickActions: 'Quick actions'
  },
  userManagement: {
    title: 'User Management',
    subtitle: 'Manage user accounts and their permissions',
    searchPlaceholder: 'Search by name, email or role...',
    filterByRole: 'Filter by role',
    filterByStatus: 'Filter by status',
    allRoles: 'All roles',
    allStatuses: 'All statuses',
    active: 'Active',
    inactive: 'Inactive',
    usersPerPage: 'users per page',
    noUsersFound: 'No users found',
    noUsersMessage: 'No users match the search criteria.',
    loadingUsers: 'Loading users...',
    userDetails: 'User details',
    editUser: 'Edit user',
    resetPassword: 'Reset password',
    toggleStatus: 'Toggle status',
    confirmDelete: 'Confirm deletion',
    actions: 'Actions',
    columns: {
      name: 'Name',
      email: 'Email',
      role: 'Role',
      status: 'Status',
      lastLogin: 'Last login',
      createdAt: 'Created at',
      actions: 'Actions'
    },
    roles: {
      client: 'Client',
      agent: 'Agent',
      admin: 'Administrator',
      super_admin: 'Super Administrator'
    },
    status: {
      active: 'Active',
      inactive: 'Inactive'
    },
    modals: {
      editUser: {
        title: 'Edit user',
        firstName: 'First name',
        lastName: 'Last name',
        email: 'Email',
        phone: 'Phone',
        role: 'Role',
        status: 'Status',
        save: 'Save',
        cancel: 'Cancel',
        saving: 'Saving...'
      },
      resetPassword: {
        title: 'Reset password',
        newPassword: 'New password',
        confirmPassword: 'Confirm password',
        generatePassword: 'Generate password',
        reset: 'Reset',
        cancel: 'Cancel',
        resetting: 'Resetting...',
        passwordRequirements: 'Password must be at least 8 characters long'
      },
      confirmAction: {
        title: 'Confirm action',
        activateUser: 'Are you sure you want to activate this user?',
        deactivateUser: 'Are you sure you want to deactivate this user?',
        confirm: 'Confirm',
        cancel: 'Cancel'
      }
    },
    success: {
      userUpdated: 'User updated successfully',
      passwordReset: 'Password reset successfully',
      userActivated: 'User activated successfully',
      userDeactivated: 'User deactivated successfully',
      dataRefreshed: 'Data refreshed successfully'
    },
    errors: {
      loadUsers: 'Error loading users',
      updateUser: 'Error updating user',
      resetPassword: 'Error resetting password',
      updateStatus: 'Error updating status',
      invalidEmail: 'Invalid email address',
      passwordMismatch: 'Passwords do not match',
      passwordTooShort: 'Password must be at least 8 characters long',
      refreshFailed: 'Failed to refresh data',
      networkError: 'Network connection error',
      unauthorized: 'You are not authorized to perform this action'
    },
    validation: {
      required: 'This field is required',
      emailFormat: 'Invalid email format',
      phoneFormat: 'Invalid phone format',
      passwordLength: 'Password must be at least 8 characters long'
    }
  },
  permissions: {
    title: 'Permission Management',
    subtitle: 'Configure authorizations and access',
    userPermissions: 'User permissions',
    rolePermissions: 'Role permissions',
    accessControl: 'Access control'
  },
  settings: {
    title: 'Administrator Settings',
    subtitle: 'Advanced platform configuration',
    general: 'General',
    security: 'Security',
    notifications: 'Notifications',
    maintenance: 'Maintenance'
  },
  logs: {
    title: 'System Logs',
    subtitle: 'Activity monitoring and audit',
    systemLogs: 'System logs',
    userActions: 'User actions',
    errorLogs: 'Error logs',
    auditTrail: 'Audit trail'
  }
};