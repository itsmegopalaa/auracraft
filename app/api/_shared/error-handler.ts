import { NextResponse } from "next/server";
import { AppError } from "@/app/lib/errors";

export function handleApiError(
  error: unknown,
  fallbackMessage = "Something went wrong."
) {
  console.error("API ERROR:", error);

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: fallbackMessage,
    },
    { status: 500 }
  );
}
