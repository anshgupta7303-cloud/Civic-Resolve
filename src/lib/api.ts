import {
  Complaint,
  AdminKPIs,
  ActionQueueItem,
  AIInsight,
  AreaInsight,
  DuplicatePreview,
  Notification,
  User,
  DepartmentMeta,
} from '../types.js';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('civic_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

export async function fetchApi<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Complaints
  async getComplaints(params: Record<string, string> = {}): Promise<{ complaints: Complaint[] }> {
    const query = new URLSearchParams(params).toString();
    return fetchApi<{ complaints: Complaint[] }>(`/api/complaints${query ? `?${query}` : ''}`);
  },

  async getComplaintById(
    id: string
  ): Promise<{ complaint: Complaint; potentialDuplicates: DuplicatePreview[] }> {
    return fetchApi<{ complaint: Complaint; potentialDuplicates: DuplicatePreview[] }>(
      `/api/complaints/${encodeURIComponent(id)}`
    );
  },

  async createComplaint(data: {
    title: string;
    description: string;
    category?: string;
    ward: string;
    address: string;
    landmark?: string;
    imageUrl?: string;
    citizenName?: string;
    citizenPhone?: string;
    citizenEmail?: string;
  }): Promise<{ complaint: Complaint; duplicatesFound: DuplicatePreview[] }> {
    return fetchApi('/api/complaints', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async checkDuplicates(data: {
    title: string;
    description?: string;
    ward: string;
    department?: string;
    address?: string;
    landmark?: string;
  }): Promise<{ duplicates: DuplicatePreview[] }> {
    return fetchApi('/api/complaints/check-duplicate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateComplaintStatus(
    id: string,
    data: {
      status: string;
      remarks?: string;
      proofImageUrl?: string;
      assignedOfficer?: string;
    }
  ): Promise<{ complaint: Complaint }> {
    return fetchApi(`/api/complaints/${encodeURIComponent(id)}/status`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async upvoteComplaint(id: string): Promise<{ complaint: Complaint; hasUpvoted: boolean }> {
    return fetchApi(`/api/complaints/${encodeURIComponent(id)}/upvote`, {
      method: 'POST',
    });
  },

  async getDepartments(): Promise<{ departments: DepartmentMeta[] }> {
    return fetchApi('/api/complaints/departments');
  },

  // Admin
  async getAdminKpis(): Promise<{ kpis: AdminKPIs }> {
    return fetchApi('/api/admin/kpis');
  },

  async getAdminActionQueue(): Promise<{ queue: ActionQueueItem[] }> {
    return fetchApi('/api/admin/action-queue');
  },

  async getAdminAiInsights(): Promise<{ insights: AIInsight[] }> {
    return fetchApi('/api/admin/ai-insights');
  },

  async getAdminAreaInsights(): Promise<{ areaInsights: AreaInsight[] }> {
    return fetchApi('/api/admin/area-insights');
  },

  async getAdminAnalytics(): Promise<{
    byDepartment: Record<string, number>;
    byPriority: Record<string, number>;
    byStatus: Record<string, number>;
    total: number;
  }> {
    return fetchApi('/api/admin/analytics');
  },

  async reassignComplaint(
    id: string,
    data: {
      department?: string;
      priority?: string;
      assignedOfficer?: string;
      remarks?: string;
    }
  ): Promise<{ complaint: Complaint }> {
    return fetchApi(`/api/admin/complaints/${encodeURIComponent(id)}/reassign`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async mergeComplaint(
    id: string,
    data: { primaryComplaintId: string; reason?: string }
  ): Promise<{ success: boolean; primaryId: string; mergedId: string }> {
    return fetchApi(`/api/admin/complaints/${encodeURIComponent(id)}/merge`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: Notification[] }> {
    return fetchApi('/api/notifications');
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return fetchApi(`/api/notifications/${encodeURIComponent(id)}/read`, {
      method: 'POST',
    });
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return fetchApi('/api/notifications/read-all', {
      method: 'POST',
    });
  },

  // Auth
  async login(email: string, password?: string): Promise<{ user: User; token: string }> {
    return fetchApi('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(data: {
    name: string;
    email: string;
    phone?: string;
    ward?: string;
    password?: string;
  }): Promise<{ user: User; token: string }> {
    return fetchApi('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getDemoUsers(): Promise<{ users: User[] }> {
    return fetchApi('/api/auth/demo-users');
  },
};
