export interface Board {
  id: number;
  title: string;
  created_at: string;
}

export interface Column {
  id: number;
  board_id: number;
  title: string;
  position: number;
}

export interface Task {
  id: number;
  column_id: number;
  title: string;
  description?: string;
  position: number;
  created_at: string;
}

export interface ColumnWithTasks extends Column {
  tasks: Task[];
}

export interface BoardDetail extends Board {
  columns: ColumnWithTasks[];
}

export interface SuccessResponse {
  success: boolean;
}