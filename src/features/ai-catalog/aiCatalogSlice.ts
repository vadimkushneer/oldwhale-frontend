import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AiGroupPublic } from "../../api/types";
import { setAiCatalog } from "../../legacy/domain/ai";
import { aiCatalogApi } from "./aiCatalogApi";

export const OW_AI_CATALOG_CACHE_KEY = "ow_ai_catalog_v1";

function readCache(): AiGroupPublic[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(OW_AI_CATALOG_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || !("groups" in parsed)) return null;
    const g = (parsed as { groups: unknown }).groups;
    if (!Array.isArray(g)) return null;
    return g as AiGroupPublic[];
  } catch {
    return null;
  }
}

const cached = readCache();
if (cached?.length) {
  setAiCatalog(cached);
}

export interface AiCatalogState {
  /** Bumped whenever `setAiCatalog` runs so consumers can re-select from Redux. */
  revision: number;
}

const initialState: AiCatalogState = {
  revision: cached?.length ? 1 : 0,
};

export const aiCatalogSlice = createSlice({
  name: "aiCatalog",
  initialState,
  reducers: {
    bumpRevision(state) {
      state.revision += 1;
    },
    hydrateFromCache(state, action: PayloadAction<AiGroupPublic[]>) {
      setAiCatalog(action.payload);
      try {
        localStorage.setItem(OW_AI_CATALOG_CACHE_KEY, JSON.stringify({ groups: action.payload }));
      } catch {
        /* ignore */
      }
      state.revision += 1;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(aiCatalogApi.endpoints.getPublicCatalog.matchFulfilled, (state, action) => {
      const groups = action.payload.groups;
      setAiCatalog(groups);
      try {
        localStorage.setItem(OW_AI_CATALOG_CACHE_KEY, JSON.stringify({ groups }));
      } catch {
        /* ignore */
      }
      state.revision += 1;
    });
  },
});

export const { bumpRevision, hydrateFromCache } = aiCatalogSlice.actions;
