import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./features/auth/authSlice";
import { adminApi } from "./features/admin/adminApi";
import { aiCatalogApi } from "./features/ai-catalog/aiCatalogApi";
import { aiCatalogSlice } from "./features/ai-catalog/aiCatalogSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    aiCatalog: aiCatalogSlice.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [aiCatalogApi.reducerPath]: aiCatalogApi.reducer,
  },
  middleware: (gDM) =>
    gDM({ serializableCheck: false }).concat(adminApi.middleware, aiCatalogApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
