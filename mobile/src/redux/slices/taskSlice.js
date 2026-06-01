import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
};

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    setTasks(state, action) {
      state.items = action.payload ?? [];
    },
  },
});

export const { setTasks } = taskSlice.actions;
export default taskSlice.reducer;
