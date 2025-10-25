import { 
  submitLogin as authSubmitLogin,
  submitRegister as authSubmitRegister,
  submitRegisterAndLogin as authSubmitRegisterAndLogin,
  logout as authLogout
} from "@/features/auth/service/authService";
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse
} from "../model/types";

// Прокси функции для совместимости - делегируют вызовы в features/auth
export async function submitRegister(data: RegisterRequest): Promise<RegisterResponse> {
  return authSubmitRegister(data);
}

export async function submitLogin(data: LoginRequest): Promise<LoginResponse> {
  return authSubmitLogin(data);
}

export async function submitRegisterAndLogin(data: RegisterRequest): Promise<LoginResponse> {
  return authSubmitRegisterAndLogin(data);
}

export async function logout(): Promise<void> {
  return authLogout();
}
