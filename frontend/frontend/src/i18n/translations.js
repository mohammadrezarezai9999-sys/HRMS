/**
 * Bilingual dictionary (FA / EN)
 * Keys are used via t('key') from LanguageContext
 */
const translations = {
  fa: {
    // Common
    appName: 'سامانه منابع انسانی',
    loading: 'در حال بارگذاری...',
    logout: 'خروج از حساب',
    save: 'ذخیره',
    cancel: 'انصراف',
    delete: 'حذف',
    edit: 'ویرایش',
    add: 'افزودن',
    search: 'جستجو',
    actions: 'عملیات',
    status: 'وضعیت',
    notFound: '۴۰۴ - صفحه یافت نشد',
    language: 'زبان',

    // Auth
    loginTitle: 'ورود به سامانه HRMS',
    username: 'نام کاربری',
    password: 'رمز عبور',
    login: 'ورود',
    loginError: 'نام کاربری یا رمز عبور اشتباه است',

    // Roles / Panels
    adminPanel: 'پنل مدیریت',
    employeePanel: 'پنل کارمند',
    systemManagement: 'مدیریت سیستم',
    userMenu: 'منوی کاربری',

    // Admin menu
    dashboard: 'داشبورد',
    users: 'مدیریت کاربران',
    employees: 'کارمندان',
    departments: 'دپارتمان‌ها',
    positions: 'سمت‌ها',
    attendance: 'حضور و غیاب',
    contracts: 'قراردادها',
    leaves: 'مرخصی‌ها',
    leaveTypes: 'انواع مرخصی',
    payroll: 'حقوق و دستمزد',
    performance: 'ارزیابی عملکرد',
    documents: 'اسناد کارکنان',
    notifications: 'اعلان‌ها',

    // Employee menu
    myProfile: 'پروفایل من',
    myAttendance: 'حضور و غیاب',
    myLeaves: 'مرخصی‌ها',
    myContracts: 'قراردادها',
    myPayroll: 'حقوق و دستمزد',
    myPerformance: 'ارزیابی عملکرد',
    myDocuments: 'اسناد من',
    myNotifications: 'اعلان‌ها',

    // Misc
    managementSystem: 'سیستم مدیریت',
  },

  en: {
    appName: 'HR Management System',
    loading: 'Loading...',
    logout: 'Logout',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    actions: 'Actions',
    status: 'Status',
    notFound: '404 - Page not found',
    language: 'Language',

    loginTitle: 'Login to HRMS',
    username: 'Username',
    password: 'Password',
    login: 'Login',
    loginError: 'Invalid username or password',

    adminPanel: 'Admin Panel',
    employeePanel: 'Employee Panel',
    systemManagement: 'System Management',
    userMenu: 'User Menu',

    dashboard: 'Dashboard',
    users: 'Users',
    employees: 'Employees',
    departments: 'Departments',
    positions: 'Positions',
    attendance: 'Attendance',
    contracts: 'Contracts',
    leaves: 'Leaves',
    leaveTypes: 'Leave Types',
    payroll: 'Payroll',
    performance: 'Performance',
    documents: 'Documents',
    notifications: 'Notifications',

    myProfile: 'My Profile',
    myAttendance: 'Attendance',
    myLeaves: 'Leaves',
    myContracts: 'Contracts',
    myPayroll: 'Payroll',
    myPerformance: 'Performance',
    myDocuments: 'My Documents',
    myNotifications: 'Notifications',

    managementSystem: 'Management System',
  },
};

export default translations;
