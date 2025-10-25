import { ENDPOINTS } from "@/shared/config/api";
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse, 
  RefreshRequest, 
  RefreshResponse 
} from "../model/auth";

// Логин
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(ENDPOINTS.auth.login, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let errorMessage = "Ошибка авторизации";
    
    const responseClone = res.clone();
    
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      try {
        const errorText = await responseClone.text();
        errorMessage = errorText || errorMessage;
      } catch {
        errorMessage = `Ошибка ${res.status}: ${res.statusText}`;
      }
    }
    
    throw new Error(errorMessage);
  }

  return res.json();
}

// Регистрация
export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  console.log("Register API - отправляем данные:", data);
  console.log("Register API - URL:", ENDPOINTS.auth.register);
  console.log("Register API - JSON строка:", JSON.stringify(data));
  
  const res = await fetch(ENDPOINTS.auth.register, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(data),
  });

  console.log("Register API - статус ответа:", res.status);

  if (!res.ok) {
    let errorMessage = "Ошибка регистрации";
    
    const responseClone = res.clone();
    
    try {
      const errorData = await res.json();
      console.log("Register API - ошибка JSON:", errorData);
      console.log("Register API - детали ошибок:", errorData.errors);
      
      // Формируем детальное сообщение об ошибке
      if (errorData.errors) {
        const errorDetails = Object.entries(errorData.errors)
          .map(([field, message]) => `${field}: ${message}`)
          .join(', ');
        errorMessage = `Ошибки валидации: ${errorDetails}`;
      } else {
        errorMessage = errorData.message || errorData.error || errorMessage;
      }
    } catch {
      try {
        const errorText = await responseClone.text();
        console.log("Register API - ошибка текст:", errorText);
        errorMessage = errorText || errorMessage;
      } catch {
        console.log("Register API - не удалось получить текст ошибки");
        errorMessage = `Ошибка ${res.status}: ${res.statusText}`;
      }
    }
    
    console.log("Register API - финальное сообщение об ошибке:", errorMessage);
    throw new Error(errorMessage);
  }

  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  } else {
    return { message: "Регистрация успешна" };
  }
}

// Обновление токена
export async function refreshToken(data: RefreshRequest): Promise<RefreshResponse> {
  const res = await fetch(ENDPOINTS.auth.refresh, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let errorMessage = "Ошибка обновления токена";
    
    const responseClone = res.clone();
    
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      try {
        const errorText = await responseClone.text();
        errorMessage = errorText || errorMessage;
      } catch {
        errorMessage = `Ошибка ${res.status}: ${res.statusText}`;
      }
    }
    
    throw new Error(errorMessage);
  }

  return res.json();
}

// Логаут
export interface RefreshTokenRequest {
  refreshToken: string;
}

export async function logoutApi(body: RefreshTokenRequest): Promise<void> {
  const res = await fetch(ENDPOINTS.auth.logout, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let errorMessage = "Ошибка выхода";
    const clone = res.clone();
    try {
      const data = await res.json();
      errorMessage = data.message || errorMessage;
    } catch {
      try {
        const text = await clone.text();
        errorMessage = text || errorMessage;
      } catch {
        errorMessage = `Ошибка ${res.status}: ${res.statusText}`;
      }
    }
    throw new Error(errorMessage);
  }
}
