import axios from 'axios';
import { getAuthToken, removeAuthToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';

export const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeAuthToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API types
export interface User {
  id: number;
  email: string;
  name: string;
  department?: string;
  position?: string;
  is_active: boolean;
  is_superuser: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  department?: string;
  position?: string;
}

export interface CompetencyItem {
  id: number;
  name: string;
  description?: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: number;
  text: string;
  competency_item_id: number;
  order: number;
  max_score: number;
  created_at: string;
  updated_at: string;
  competency_item?: CompetencyItem;
}

export interface QuestionWithAnswer extends Question {
  user_answer?: number;
}

export interface Answer {
  id: number;
  question_id: number;
  user_id: number;
  score: number;
  submitted_at: string;
}

export interface AnswerCreate {
  question_id: number;
  score: number;
}

export interface UserCompetency {
  id: number;
  user_id: number;
  competency_item_id: number;
  score: number;
  calculated_at: string;
  competency_item?: CompetencyItem;
}

export interface CompanyAverageCompetency {
  id: number;
  competency_item_id: number;
  average_score: number;
  total_users: number;
  calculated_at: string;
  competency_item?: CompetencyItem;
}

export interface CompetencyResult {
  user_competencies: UserCompetency[];
  company_averages: CompanyAverageCompetency[];
}

// API functions
export const authApi = {
  login: (data: LoginRequest) => {
    const formData = new URLSearchParams();
    formData.append('username', data.username);
    formData.append('password', data.password);
    
    return apiClient.post<LoginResponse>('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
  
  register: (data: RegisterRequest) => 
    apiClient.post<User>('/auth/register', data),
  
  getCurrentUser: () => 
    apiClient.get<User>('/users/me'),
};

export const questionsApi = {
  getAll: () => 
    apiClient.get<Question[]>('/questions/'),
  
  getAllWithAnswers: () => 
    apiClient.get<QuestionWithAnswer[]>('/questions/with-answers'),
  
  getById: (id: number) => 
    apiClient.get<Question>(`/questions/${id}`),
};

export const answersApi = {
  submit: (answers: AnswerCreate[]) => 
    apiClient.post<Answer[]>('/answers/', { answers }),
  
  getUserAnswers: () => 
    apiClient.get<Answer[]>('/answers/'),
};

export interface AIFeedback {
  strengths: string;
  improvements: string;
  action_plan: string;
  learning_resources: string;
  reality_check: string;
  overall: string;
}

export interface BookRecommendation {
  title: string;
  author: string;
  reason: string;
  category: string;
}

export interface AIFeedbackResponse {
  feedback: AIFeedback;
  career_suggestions: string[];
  book_recommendations: BookRecommendation[];
  generated_at: string;
  from_cache?: boolean;
}

export interface UserCareerPlan {
  id: number;
  user_id: number;
  career_direction?: string;
  target_position?: string;
  target_timeframe?: string;
  strengths_to_enhance?: string;
  weaknesses_to_overcome?: string;
  specific_goals?: string;
  personality_traits?: string;
  preferred_learning_style?: string;
  challenges_faced?: string;
  motivation_factors?: string;
  created_at: string;
  updated_at: string;
}

export interface UserCareerPlanCreate {
  career_direction?: string;
  target_position?: string;
  target_timeframe?: string;
  strengths_to_enhance?: string;
  weaknesses_to_overcome?: string;
  specific_goals?: string;
  personality_traits?: string;
  preferred_learning_style?: string;
  challenges_faced?: string;
  motivation_factors?: string;
}

export const competenciesApi = {
  getItems: () => 
    apiClient.get<CompetencyItem[]>('/competencies/items'),
  
  getResults: () => 
    apiClient.get<CompetencyResult>('/competencies/results'),
  
  getFeedback: (forceRegenerate: boolean = false) => 
    apiClient.get<AIFeedbackResponse>('/competencies/feedback', {
      params: { force_regenerate: forceRegenerate }
    }),
};

export const careerPlansApi = {
  getCareerPlan: () => 
    apiClient.get<UserCareerPlan>('/career-plans/'),
  
  createCareerPlan: (data: UserCareerPlanCreate) => 
    apiClient.post<UserCareerPlan>('/career-plans/', data),
  
  updateCareerPlan: (data: UserCareerPlanCreate) => 
    apiClient.put<UserCareerPlan>('/career-plans/', data),
  
  deleteCareerPlan: () => 
    apiClient.delete('/career-plans/'),
};