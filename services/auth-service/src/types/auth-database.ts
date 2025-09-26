/**
 * Types spécifiques à la base de données du service auth
 * Types uniques qui ne sont pas dans shared-types
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
