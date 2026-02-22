import type { TrafficImageResponse } from "../types/traffic";

const BASE_URL = "http://127.0.0.1:8000";

export async function detectTrafficImage(
  file: File
): Promise<TrafficImageResponse> {

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/detect-traffic-image`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error("Traffic detection failed");
  }

  return response.json();
}
