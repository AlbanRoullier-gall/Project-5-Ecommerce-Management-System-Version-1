import {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  User,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
} from "../shared-types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:13000";

class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/auth`;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.makeRequest<LoginResponse>("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    // Store token in localStorage
    if (response.token) {
      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
    }

    return response;
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    const response = await this.makeRequest<RegisterResponse>("/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    // Store token in localStorage
    if (response.token) {
      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest("/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      // Always clear local storage
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
    }
  }

  // Profile management
  async getProfile(): Promise<User> {
    return await this.makeRequest<User>("/profile", {
      method: "GET",
    });
  }

  async updateProfile(
    profileData: UpdateProfileRequest
  ): Promise<{ user: User; message: string }> {
    return await this.makeRequest<{ user: User; message: string }>("/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(
    passwordData: ChangePasswordRequest
  ): Promise<{ message: string }> {
    return await this.makeRequest<{ message: string }>("/change-password", {
      method: "POST",
      body: JSON.stringify(passwordData),
    });
  }

  // Password reset
  async forgotPassword(
    data: ForgotPasswordRequest
  ): Promise<{ message: string; resetToken?: string; expiresAt?: string }> {
    return await this.makeRequest<{
      message: string;
      resetToken?: string;
      expiresAt?: string;
    }>("/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async resetPassword(
    data: ResetPasswordRequest
  ): Promise<{ message: string }> {
    return await this.makeRequest<{ message: string }>("/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Utility methods
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  }

  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Decode JWT to check expiration
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 > Date.now();
    } catch (error) {
      console.error("Error decoding token:", error);
      return false;
    }
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === "admin";
  }

  // Session management
  async getSessions(): Promise<any[]> {
    return await this.makeRequest<any[]>("/sessions", {
      method: "GET",
    });
  }

  async deleteSession(sessionId: number): Promise<{ message: string }> {
    return await this.makeRequest<{ message: string }>(
      `/sessions/${sessionId}`,
      {
        method: "DELETE",
      }
    );
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
