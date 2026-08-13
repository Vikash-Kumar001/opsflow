import { publicEnv } from "@/lib/env";

import {
  ApiError,
  createApiErrorFromResponse,
  normalizeApiError,
} from "./api-error";
import type { ApiErrorResponse, ApiResponse } from "./api-response.types";

type ApiRequestOptions = Omit<RequestInit, "body" | "credentials"> & {
  body?: unknown;
};

export async function apiRequest<TData>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TData> {
  try {
    const response = await fetch(buildApiUrl(path), {
      ...options,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const payload = await parseApiResponse<TData>(response);

    if (!response.ok && payload.success) {
      throw new ApiError({
        status: response.status,
        code: "HTTP_ERROR",
        message: `API request failed with status ${response.status}`,
      });
    }

    if (!payload.success) {
      throw createApiErrorFromResponse(response.status, payload);
    }

    return payload.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const apiBaseUrl = publicEnv.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");

  return `${apiBaseUrl}${normalizedPath}`;
}

async function parseApiResponse<TData>(
  response: Response,
): Promise<ApiResponse<TData>> {
  const text = await response.text();

  if (!text) {
    return buildEmptyResponse<TData>(response);
  }

  try {
    return JSON.parse(text) as ApiResponse<TData>;
  } catch {
    return buildInvalidJsonResponse(response);
  }
}

function buildEmptyResponse<TData>(response: Response): ApiResponse<TData> {
  if (response.ok) {
    return {
      success: true,
      data: undefined as TData,
    };
  }

  return {
    success: false,
    error: {
      code: "HTTP_ERROR",
      message: `API request failed with status ${response.status}`,
    },
  };
}

function buildInvalidJsonResponse(response: Response): ApiErrorResponse {
  return {
    success: false,
    error: {
      code: "INVALID_JSON_RESPONSE",
      message: `API returned invalid JSON with status ${response.status}`,
    },
  };
}
