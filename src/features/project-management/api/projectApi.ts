import { ENDPOINTS } from "@/shared/config/api";
import { StorageService } from "@/shared/services/storageService";
import { logger } from "@/shared/utils/logger";
import { 
  CreateProjectRequest, 
  ProjectResponse, 
  AddMemberRequest 
} from "../model/projectTypes";

// Создание проекта
export async function createProject(data: CreateProjectRequest): Promise<void> {
  const token = StorageService.getAccessToken();
  
  logger.info("Создаем проект", { name: data.name });
  
  if (!token) {
    throw new Error("Токен авторизации не найден. Пожалуйста, войдите в систему.");
  }

  try {
    const res = await fetch(ENDPOINTS.projects.create, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let errorMessage = "Ошибка создания проекта";
      
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `Ошибка ${res.status}: ${res.statusText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    logger.success("Проект успешно создан", { name: data.name });
  } catch (error) {
    logger.error("Ошибка при создании проекта", error);
    throw error;
  }
}

// Получение всех проектов
export async function getProjects(): Promise<ProjectResponse[]> {
  const token = StorageService.getAccessToken();
  
  logger.info("Получаем список проектов");
  
  if (!token) {
    throw new Error("Токен авторизации не найден. Пожалуйста, войдите в систему.");
  }

  try {
    const res = await fetch(ENDPOINTS.projects.list, {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}`
      },
    });

    if (!res.ok) {
      let errorMessage = "Ошибка получения проектов";
      
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `Ошибка ${res.status}: ${res.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    const projects = await res.json();
    logger.success("Проекты успешно загружены", { count: projects.length });
    return projects;
  } catch (error) {
    logger.error("Ошибка при получении проектов", error);
    throw error;
  }
}

// Добавление участника в проект
export async function addProjectMember(projectId: number, data: AddMemberRequest): Promise<void> {
  const token = StorageService.getAccessToken();
  
  logger.info("Добавляем участника в проект", { projectId, memberEmail: data.memberEmail });
  
  if (!token) {
    throw new Error("Токен авторизации не найден. Пожалуйста, войдите в систему.");
  }

  try {
    const res = await fetch(ENDPOINTS.projects.addMember(projectId, data.memberEmail), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let errorMessage = "Ошибка добавления участника";
      
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `Ошибка ${res.status}: ${res.statusText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    logger.success("Участник успешно добавлен в проект", { projectId, memberEmail: data.memberEmail });
  } catch (error) {
    logger.error("Ошибка при добавлении участника", error);
    throw error;
  }
}

// Удаление проекта
export async function deleteProject(projectId: number): Promise<void> {
  const token = StorageService.getAccessToken();
  
  logger.info("Удаляем проект", { projectId });
  
  if (!token) {
    throw new Error("Токен авторизации не найден. Пожалуйста, войдите в систему.");
  }

  try {
    const res = await fetch(ENDPOINTS.projects.delete(projectId), {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      },
    });

    if (!res.ok) {
      let errorMessage = "Ошибка удаления проекта";
      
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `Ошибка ${res.status}: ${res.statusText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    logger.success("Проект успешно удален", { projectId });
  } catch (error) {
    logger.error("Ошибка при удалении проекта", error);
    throw error;
  }
}
