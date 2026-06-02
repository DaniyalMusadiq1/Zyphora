import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// Async Thunks
export const fetchTasks = createAsyncThunk(
  'task/fetchTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/mine/tasks');
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

export const completeTask = createAsyncThunk(
  'task/completeTask',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/mine/tasks/${taskId}/complete`);
      return { taskId, data: response.data.data || response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete task');
    }
  }
);

const initialState = {
  tasks: [],
  totalTasks: 0,
  completedCount: 0,
  pendingCount: 0,
  loading: false,
  completingId: null,
  error: null,
};

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetTasks: (state) => {
      state.tasks = [];
      state.totalTasks = 0;
      state.completedCount = 0;
      state.pendingCount = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks || [];
        state.totalTasks = action.payload.total_tasks || 0;
        state.completedCount = action.payload.completed_count || 0;
        state.pendingCount = action.payload.pending_count || 0;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Complete Task
      .addCase(completeTask.pending, (state, action) => {
        state.completingId = action.meta.arg;
        state.error = null;
      })
      .addCase(completeTask.fulfilled, (state, action) => {
        state.completingId = null;
        const { taskId, data } = action.payload;
        const taskIndex = state.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
          state.tasks[taskIndex] = {
            ...state.tasks[taskIndex],
            is_completed: true,
            status: data.status || 'verified',
          };
        }
        state.completedCount += 1;
        state.pendingCount = Math.max(0, state.pendingCount - 1);
      })
      .addCase(completeTask.rejected, (state, action) => {
        state.completingId = null;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetTasks } = taskSlice.actions;
export default taskSlice.reducer;
