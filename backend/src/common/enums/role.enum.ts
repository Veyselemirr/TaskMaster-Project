export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
}

export enum Permission {
  READ_USERS = 'read:users',
  CREATE_USERS = 'create:users',
  UPDATE_USERS = 'update:users',
  DELETE_USERS = 'delete:users',
  
  READ_TASKS = 'read:tasks',
  CREATE_TASKS = 'create:tasks',
  UPDATE_TASKS = 'update:tasks',
  DELETE_TASKS = 'delete:tasks',
  
  READ_OWN_TASKS = 'read:own_tasks',
  CREATE_OWN_TASKS = 'create:own_tasks',
  UPDATE_OWN_TASKS = 'update:own_tasks',
  DELETE_OWN_TASKS = 'delete:own_tasks',
  
  MANAGE_ROLES = 'manage:roles',
  VIEW_ANALYTICS = 'view:analytics',
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    Permission.READ_USERS,
    Permission.CREATE_USERS,
    Permission.UPDATE_USERS,
    Permission.DELETE_USERS,
    Permission.READ_TASKS,
    Permission.CREATE_TASKS,
    Permission.UPDATE_TASKS,
    Permission.DELETE_TASKS,
    Permission.MANAGE_ROLES,
    Permission.VIEW_ANALYTICS,
  ],
  [Role.PROJECT_MANAGER]: [
    Permission.READ_USERS,
    Permission.READ_TASKS,
    Permission.CREATE_TASKS,
    Permission.UPDATE_TASKS,
    Permission.DELETE_TASKS,
    Permission.VIEW_ANALYTICS,
  ],
  [Role.MODERATOR]: [
    Permission.READ_USERS,
    Permission.READ_TASKS,
    Permission.CREATE_TASKS,
    Permission.UPDATE_TASKS,
    Permission.VIEW_ANALYTICS,
  ],
  [Role.USER]: [
    Permission.READ_OWN_TASKS,
    Permission.CREATE_OWN_TASKS,
    Permission.UPDATE_OWN_TASKS,
    Permission.DELETE_OWN_TASKS,
  ],
};