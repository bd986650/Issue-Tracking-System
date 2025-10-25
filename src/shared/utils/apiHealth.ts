import { API_BASE_URL } from "@/shared/config/api";

export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}

export async function checkApiConnection(): Promise<{ available: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Если получили 401, значит API доступен, но нужна авторизация
    if (response.status === 401) {
      return { available: true };
    }
    
    // Если получили 200, значит API доступен и авторизация работает
    if (response.ok) {
      return { available: true };
    }
    
    return { available: false, error: `HTTP ${response.status}` };
  } catch (error) {
    return { 
      available: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
