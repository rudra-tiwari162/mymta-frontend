/**
 * Shared code between client and server
 */

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'employee';
  is_active: boolean;
}

export interface UserCreateRequest {
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'employee';
  password?: string;
}

export interface Attendance {
  id: string;
  user: string;
  clock_in: string;
  clock_out: string | null;
  date: string;
}

export interface DailyLog {
  id: string;
  user: string;
  type: 'SOD' | 'EOD';
  content: string;
  created_at: string;
}

export interface PortalPost {
  id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
}
