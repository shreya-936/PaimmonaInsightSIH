const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

async function request(endpoint, options = {}) {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    }
  );

  if (!response.ok) {
    let message = "API request failed.";

    try {
      const data = await response.json();

      message =
        data.detail ||
        data.message ||
        message;
    } catch {
      // Keep default error message.
    }

    throw new Error(message);
  }

  return response.json();
}


// PROJECT APIs

export async function getProjects() {
  return request("/api/projects/");
}

export async function getProject(projectId) {
  return request(`/api/projects/${projectId}`);
}

export async function createProject(projectData) {
  return request(
    "/api/projects/",
    {
      method: "POST",
      body: JSON.stringify(projectData),
    }
  );
}


// PROJECT UPDATE APIs

export async function getProjectUpdates(projectId) {
  return request(
    `/api/projects/${projectId}/updates`
  );
}

export async function createProjectUpdate(
  projectId,
  updateData
) {
  return request(
    `/api/projects/${projectId}/updates`,
    {
      method: "POST",
      body: JSON.stringify(updateData),
    }
  );
}


// PROJECT ANALYTICS APIs

export async function getProjectFeatures(projectId) {
  return request(
    `/api/projects/${projectId}/features`
  );
}

export async function getProjectRisk(projectId) {
  return request(
    `/api/projects/${projectId}/risk`
  );
}

export async function getProjectAlerts(projectId) {
  return request(
    `/api/projects/${projectId}/alerts`
  );
}


// SYSTEM APIs

export async function getHealth() {
  return request("/api/health");
}

export {
  API_BASE_URL,
};
