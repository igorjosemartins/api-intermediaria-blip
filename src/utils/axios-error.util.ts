import axios, { AxiosError } from "axios";

export function handleAxiosError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;
    const code = axiosError.code;

    // You can log the raw error for debugging
    console.error("Axios Error:", {
      message: axiosError.message,
      code,
      status,
      data,
    });

    // Then throw a clean error for your controllers
    throw new Error(
      `External API request failed [${
        status ?? code
      }]: ${JSON.stringify(data) || axiosError.message}`
    );
  }

  // Non-Axios error
  console.error("Unexpected Error:", error);
  throw new Error("Unexpected error occurred");
}