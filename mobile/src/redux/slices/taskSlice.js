import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// --- Async Thunks ---

/**
 * Fetch all available tasks for the user
 * @param {string|null} category - Optional category filter (e.g., 'social', 'daily')
 */
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (category = null, { rejectWithValue }) => {
    try {
      const params = category ? { category } : {};
      const response = await api.get('/mine/tasks', { params });
      
      // Ensure we return an array even if API wraps it differently
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load tasks');
    }
  }
);

/**
 * Submit a task completion
 * @param {object} payload - { taskId, proofData (optional) }
 */
export const completeTask = createAsyncThunk(
  'tasks/completeTask',
  async ({ taskId, proofData = null }, { rejectWithValue, getState }) => {
    try {
      const response = await api.post(`/mine/tasks/${taskId}/complete`, {
        proof_data: proofData,
      });

      // Return the updated task object or completion record
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete task');
    }
  }
);

// --- Initial State ---

const initialState = {
  list: [],             // Array of task objects
  filteredList: [],     // For client-side filtering if needed
  loading: false,
  error: null,
  completingId: null,   // ID of task currently being completed (for spinner)
  lastFetched: null,
};

// --- Slice Definition ---

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTaskError: (state) => {
      state.error = null;
    },
    resetTasks: (state) => {
      state.list = [];
      state.filteredList = [];
      state.error = null;
    },
    // Optimistic update for local status change (optional enhancement)
    updateTaskStatusLocally: (state, action) => {
      const { taskId, status } = action.payload;
      const task = state.list.find(t => t.id === taskId);
      if (task) {
        task.status = status;
        task.is_completed = status === 'completed' || status === 'verified';
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch Tasks ---
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
        state.filteredList = action.payload;
        state.lastFetched = new Date();
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Complete Task ---
      .addCase(completeTask.pending, (state, action) => {
        state.loading = true;
        state.completingId = action.meta.arg.taskId;
        state.error = null;
        
        // Optimistic UI: Mark as 'pending_verification' immediately
        const task = state.list.find(t => t.id === action.meta.arg.taskId);
        if (task) {
          task.status = 'pending_verification';
          task.is_completed = false; // Still waiting for verification
        }
      })
      .addCase(completeTask.fulfilled, (state, action) => {
        state.loading = false;
        state.completingId = null;
        
        // Update the task in the list with the new completion data
        const completedTask = action.payload;
        const index = state.list.findIndex(t => t.id === completedTask.id || t.id === completedTask.task_id);
        
        if (index !== -1) {
          // Merge the completion data into the existing task
          state.list[index] = {
            ...state.list[index],
            status: completedTask.status || 'verified',
            is_completed: true,
            completion_record: completedTask,
            points_earned: completedTask.points_earned || state.list[index].points,
          };
          
          // Also update filtered list if it exists
          const fIndex = state.filteredList.findIndex(t => t.id === completedTask.id || t.id === completedTask.task_id);
          if (fIndex !== -1) {
            state.filteredList[fIndex] = state.list[index];
          }
        }
      })
      .addCase(completeTask.rejected, (state, action) => {
        state.loading = false;
        state.completingId = null;
        state.error = action.payload;
        
        // Revert optimistic update if failed (simple revert strategy)
        // In a more complex app, you might store the previous state to revert exactly
        const taskId = action.meta.arg.taskId;
        const task = state.list.find(t => t.id === taskId);
        if (task && task.status === 'pending_verification') {
           task.status = 'available'; // Revert to available
           task.is_completed = false;
        }
      });
  },
});

// --- Exports ---

export const { clearTaskError, resetTasks, updateTaskStatusLocally } = taskSlice.actions;
export default taskSlice.reducer;