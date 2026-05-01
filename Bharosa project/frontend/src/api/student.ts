import { API_BASE_URL, apiFetch } from './config';

export interface StudentProfileData {
  name: string;
  state: string;
  academicYear: string;
  category: string;
  income: string;
  parentJob: string;
  gender: string;
  dateOfBirth?: string;
  religion?: string;
  annualIncome?: number;
  percentageClass10?: number;
  percentageClass12?: number;
  courseName?: string;
  instituteName?: string;
  hasCasteCertificate?: boolean;
  hasIncomeCertificate?: boolean;
  hasMarksheet?: boolean;
}

export const createStudentProfile = async (data: StudentProfileData) => {
  return apiFetch(`${API_BASE_URL}/student/profile`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getStudentProfile = async () => {
  return apiFetch(`${API_BASE_URL}/student/profile`);
};

export const updateStudentProfile = async (data: Partial<StudentProfileData>) => {
  return apiFetch(`${API_BASE_URL}/student/profile`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};
