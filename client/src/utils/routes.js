// Central place to define all URL paths
// This prevents typos and makes it easy to change URLs later
export const routes = {
  HOME: '/',
  ABOUT: '/about',
  SERVICES: '/services',
  COURSES: '/cursos',
  CLIENTS: '/clients',
  DEMO: '/demo',
  CONTACT: '/contact',
  LOGIN: '/login',
  DASHBOARD: {
    ADMIN: '/dashboard/admin',
    STUDENT: '/dashboard/student',
    TEACHER: '/dashboard/teacher',
    COMPANY: '/dashboard/company',
    FINANCIAL: '/dashboard/admin/financial'
  }
}

// Pages that anyone can visit without logging in
export const publicRoutes = [
  routes.HOME,
  routes.ABOUT,
  routes.SERVICES,
  routes.COURSES,
  routes.CLIENTS,
  routes.DEMO,
  routes.CONTACT,
  routes.LOGIN
]

// Pages that require user authentication
export const protectedRoutes = [
  routes.DASHBOARD.ADMIN,
  routes.DASHBOARD.STUDENT,
  routes.DASHBOARD.TEACHER,
  routes.DASHBOARD.COMPANY
]