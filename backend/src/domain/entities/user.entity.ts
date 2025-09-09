import { Role } from '../../common/enums/role.enum';

export class User {
  constructor(
    public readonly id: number,
    public readonly email: string,
    public readonly name: string | null,
    public readonly password: string,
    public readonly role: Role,
    public readonly isActive: boolean,
    public readonly isEmailVerified: boolean,
    public readonly emailVerificationToken: string | null,
    public readonly passwordResetToken: string | null,
    public readonly passwordResetExpires: Date | null,
    public readonly tokenVersion: number,
    public readonly lastLoginAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly tasks?: Task[]
  ) {}

  static create(
    email: string,
    name: string | null,
    password: string,
    role: Role = Role.USER
  ): Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
    return new User(
      0,
      email,
      name,
      password,
      role,
      true,
      false,
      null,
      null,
      null,
      0,
      null,
      new Date(),
      new Date()
    );
  }

  updateProfile(name: string | null): User {
    return new User(
      this.id,
      this.email,
      name,
      this.password,
      this.role,
      this.isActive,
      this.isEmailVerified,
      this.emailVerificationToken,
      this.passwordResetToken,
      this.passwordResetExpires,
      this.tokenVersion,
      this.lastLoginAt,
      this.createdAt,
      new Date(),
      this.tasks
    );
  }

  updatePassword(newPassword: string): User {
    return new User(
      this.id,
      this.email,
      this.name,
      newPassword,
      this.role,
      this.isActive,
      this.isEmailVerified,
      this.emailVerificationToken,
      null, // Clear password reset token
      null, // Clear password reset expiry
      this.tokenVersion + 1, // Increment token version to invalidate existing JWTs
      this.lastLoginAt,
      this.createdAt,
      new Date(),
      this.tasks
    );
  }

  verifyEmail(): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.password,
      this.role,
      this.isActive,
      true,
      null, // Clear verification token
      this.passwordResetToken,
      this.passwordResetExpires,
      this.tokenVersion,
      this.lastLoginAt,
      this.createdAt,
      new Date(),
      this.tasks
    );
  }

  setPasswordResetToken(token: string, expires: Date): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.password,
      this.role,
      this.isActive,
      this.isEmailVerified,
      this.emailVerificationToken,
      token,
      expires,
      this.tokenVersion,
      this.lastLoginAt,
      this.createdAt,
      new Date(),
      this.tasks
    );
  }

  updateLastLogin(): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.password,
      this.role,
      this.isActive,
      this.isEmailVerified,
      this.emailVerificationToken,
      this.passwordResetToken,
      this.passwordResetExpires,
      this.tokenVersion,
      new Date(),
      this.createdAt,
      new Date(),
      this.tasks
    );
  }

  deactivate(): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.password,
      this.role,
      false,
      this.isEmailVerified,
      this.emailVerificationToken,
      this.passwordResetToken,
      this.passwordResetExpires,
      this.tokenVersion + 1, // Invalidate existing tokens
      this.lastLoginAt,
      this.createdAt,
      new Date(),
      this.tasks
    );
  }

  activate(): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.password,
      this.role,
      true,
      this.isEmailVerified,
      this.emailVerificationToken,
      this.passwordResetToken,
      this.passwordResetExpires,
      this.tokenVersion,
      this.lastLoginAt,
      this.createdAt,
      new Date(),
      this.tasks
    );
  }

  changeRole(newRole: Role): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.password,
      newRole,
      this.isActive,
      this.isEmailVerified,
      this.emailVerificationToken,
      this.passwordResetToken,
      this.passwordResetExpires,
      this.tokenVersion + 1, // Invalidate existing tokens
      this.lastLoginAt,
      this.createdAt,
      new Date(),
      this.tasks
    );
  }

  isValidEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  canLogin(): boolean {
    return this.isActive && this.isEmailVerified;
  }

  isPasswordResetTokenValid(): boolean {
    return (
      !!this.passwordResetToken &&
      !!this.passwordResetExpires &&
      this.passwordResetExpires > new Date()
    );
  }

  hasRole(role: Role): boolean {
    return this.role === role;
  }

  isAdmin(): boolean {
    return this.role === Role.ADMIN;
  }
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  priority: Priority;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}