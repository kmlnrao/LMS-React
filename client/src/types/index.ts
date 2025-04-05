import { User as SchemaUser } from "@shared/schema";

export interface PaginationParams {
  offset?: number;
  limit?: number;
}

export interface UserWithToken extends SchemaUser {
  token?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface UserSession {
  user: SchemaUser;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface StatsChange {
  value: number;
  isPositive: boolean;
  label: string;
}

export interface ReportCardProps {
  title: string;
  value: string | number;
  description: string;
  change?: StatsChange;
  isLoading?: boolean;
}

export interface TableActionProps<T> {
  row: T;
  onEdit: (data: T) => void;
  onDelete: (id: number) => void;
}

export interface FormProps<T> {
  data?: T | null;
  onClose: () => void;
}

export interface IntegrationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  status: "active" | "inactive" | "pending";
}
