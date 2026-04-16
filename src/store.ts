import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./features/auth/authSlice";
import { adminApi } from "./features/admin/adminApi";

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (gDM) => gDM({ serializableCheck: false }).concat(adminApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
