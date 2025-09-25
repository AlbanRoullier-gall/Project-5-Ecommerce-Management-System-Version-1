/**
 * Type definitions for the auth service
 */

export interface UserData {
  user_id: number | null;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: "admin" | "customer";
  is_active: boolean;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface UserSessionData {
  session_id: number | null;
  user_id: number;
  token_hash: string;
  expires_at: Date;
  created_at: Date | null;
}

export interface PasswordResetData {
  reset_id: number | null;
  user_id: number;
  reset_token: string;
  expires_at: Date;
  created_at: Date | null;
}

export interface UserPublicDTO {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: "admin" | "customer";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSessionPublicDTO {
  sessionId: number;
  userId: number;
  expiresAt: Date;
  createdAt: Date;
  isValid: boolean;
  timeUntilExpiration: number;
}

export interface PasswordResetPublicDTO {
  resetId: number;
  userId: number;
  expiresAt: Date;
  createdAt: Date;
  isValid: boolean;
  timeUntilExpiration: number;
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: "admin" | "customer";
  firstName: string;
  lastName: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName: string;
  lastName: string;
  role?: "admin" | "customer";
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: "admin" | "customer";
  isActive?: boolean;
}
