/**
 * Role-based access control utilities
 */

// Define role levels (higher number means more privileges)
export const ROLE_LEVELS: Record<string, number> = {
  'admin': 100,
  'manager': 80,
  'supervisor': 70,
  'billing': 60,
  'reports': 60,
  'inventory': 50,
  'technician': 40,
  'department': 30,
  'staff': 20
};

// Define which features are accessible by which roles
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  // Admin has access to everything
  'admin': [
    'dashboard', 
    'tasks', 
    'inventory',
    'equipment',
    'departments',
    'processes',
    'users',
    'billing',
    'reports',
    'settings',
    'hms-integration'
  ],
  
  // Manager has access to most features except for full system settings and user management
  'manager': [
    'dashboard', 
    'tasks', 
    'inventory',
    'equipment',
    'departments',
    'processes',
    'billing',
    'reports',
    'hms-integration'
  ],
  
  // Supervisor focuses on operational aspects
  'supervisor': [
    'dashboard', 
    'tasks', 
    'inventory',
    'equipment',
    'departments',
    'processes'
  ],
  
  // Staff has access to basic day-to-day operations
  'staff': [
    'dashboard', 
    'tasks'
  ],
  
  // Department users focus on their department tasks
  'department': [
    'dashboard',
    'tasks',
    'reports'
  ],
  
  // Inventory specialist
  'inventory': [
    'dashboard',
    'tasks',
    'inventory',
    'equipment'
  ],
  
  // Technician focuses on equipment
  'technician': [
    'dashboard',
    'tasks',
    'equipment'
  ],
  
  // Billing specialist
  'billing': [
    'dashboard',
    'tasks',
    'billing',
    'reports'
  ],
  
  // Reports specialist
  'reports': [
    'dashboard',
    'tasks',
    'reports'
  ]
};

/**
 * Check if a user has access to a specific feature based on their role
 * @param userRole The user's role
 * @param feature The feature to check access for
 * @returns Boolean indicating if the user has access
 */
export function hasPermission(userRole: string, feature: string): boolean {
  // If role doesn't exist, deny access
  if (!ROLE_PERMISSIONS[userRole]) {
    return false;
  }
  
  // Check if the feature is in the role's permissions
  return ROLE_PERMISSIONS[userRole].includes(feature);
}

/**
 * Check if a user role has a minimum level
 * @param userRole The user's role
 * @param minimumRole The minimum role required
 * @returns Boolean indicating if the user has sufficient level
 */
export function hasMinimumRole(userRole: string, minimumRole: string): boolean {
  const userLevel = ROLE_LEVELS[userRole] || 0;
  const requiredLevel = ROLE_LEVELS[minimumRole] || 0;
  
  return userLevel >= requiredLevel;
}

/**
 * Get features accessible by a user role
 * @param userRole The user's role
 * @returns Array of feature names the user can access
 */
export function getAccessibleFeatures(userRole: string): string[] {
  return ROLE_PERMISSIONS[userRole] || [];
}