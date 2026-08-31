import { NextResponse } from "next/server";
import type { ApiResponse } from "@/app/types";

export function successResponse<T>(
  data?: T,
  status = 200,
  message?: string
) {
  const body: ApiResponse<T> = {
    success: true,
    ...(data !== undefined ? { data } : {}),
    ...(message ? { message } : {}),
  };

  return NextResponse.json(body, { status });
}

export function errorResponse(
  error: string,
  status = 500,
  code?: string
) {
  const body: ApiResponse = {
    success: false,
    error,
    ...(code ? { code } : {}),
  };

  return NextResponse.json(body, { status });
}
