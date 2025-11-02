import { ENDPOINTS } from "@/shared/config/api";
import { apiFetch } from "@/shared/services/apiClient";
import { logger } from "@/shared/utils/logger";
import { 
  CreateProjectRequest, 
  ProjectResponse, 
  AddMemberRequest 
} from "../model/projectTypes";

// Создание проекта
export async function createProject(data: CreateProjectRequest): Promise<void> {
  try {
    const res = await apiFetch(ENDPOINTS.projects.create, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
  try {
    const res = await apiFetch(ENDPOINTS.projects.list, {
      method: "GET",
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
  try {
    const res = await apiFetch(ENDPOINTS.projects.addMember(projectId, data.memberEmail), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
  try {
    const res = await apiFetch(ENDPOINTS.projects.delete(projectId), {
      method: "DELETE",
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
