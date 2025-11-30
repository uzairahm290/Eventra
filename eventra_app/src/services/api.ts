const API_BASE_URL = '/api'; // Uses Vite proxy configured in vite.config.ts

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    dateRegistered: string;
    profileImageBase64?: string;
  };
}

export interface ProfileResponse {
  firstName?: string;
  secondName?: string;
  userName?: string;
  userMail?: string;
  profileImageBase64?: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  private ensureOnline() {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('You appear to be offline. Please check your network connection.');
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Convert frontend field names to backend field names
    const backendLoginRequest = {
      userMail: credentials.email,
      password: credentials.password
    };

    const response = await fetch(`${API_BASE_URL}/Auth/Login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendLoginRequest),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data: AuthResponse = await response.json();
    this.token = data.token;
    try {
      localStorage.setItem('token', data.token);
    } catch {
      // Ignore localStorage errors in environments without storage
    }
    return data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    // Convert frontend field names to backend field names
    const backendRegisterRequest = {
      firstName: userData.firstName,
      secondName: userData.lastName,
      userName: userData.email.split('@')[0], // Use email prefix as username
      userMail: userData.email,
      password: userData.password
    };

    const response = await fetch(`${API_BASE_URL}/Auth/Register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendRegisterRequest),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const data: AuthResponse = await response.json();
    this.token = data.token;
    try {
      localStorage.setItem('token', data.token);
    } catch {
      // Ignore localStorage errors in environments without storage
    }
    return data;
  }

  setToken(token: string) {
    this.token = token;
    try {
      localStorage.setItem('token', token);
    } catch {
      // Ignore localStorage errors
    }
  }

  clearToken() {
    this.token = null;
    try {
      localStorage.removeItem('token');
    } catch {
      // Ignore localStorage errors
    }
  }

  private async parseJsonSafe(response: Response) {
    if (response.status === 204) return undefined;
    const text = await response.text();
    if (!text) return undefined;
    try {
      return JSON.parse(text);
    } catch {
      // Fallback for non-JSON responses
      return text;
    }
  }

  // Generic GET request
  async get(endpoint: string) {
    this.ensureOnline();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return await this.parseJsonSafe(response);
  }

  // Generic POST request
  async post(endpoint: string, data?: unknown) {
    this.ensureOnline();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return await this.parseJsonSafe(response);
  }

  // Generic PUT request
  async put(endpoint: string, data?: unknown) {
    this.ensureOnline();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return await this.parseJsonSafe(response);
  }

  // Generic DELETE request
  async delete(endpoint: string) {
    this.ensureOnline();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return await this.parseJsonSafe(response);
  }
}

export const apiService = new ApiService();
