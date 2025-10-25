import { ENDPOINTS } from "@/shared/config/api";
import { StorageService } from "@/shared/services/storageService";
import { logger } from "@/shared/utils/logger";
import { 
  Sprint, 
  CreateSprintRequest, 
  UpdateSprintRequest 
} from "../model/sprintTypes";

// Создание спринта
export async function createSprint(projectId: number, data: CreateSprintRequest): Promise<void> {
  const token = StorageService.getAccessToken();
  
  logger.info("Создаем спринт", { name: data.name, projectId });
  
  if (!token) {
    throw new Error("Токен авторизации не найден. Пожалуйста, войдите в систему.");
  }

  try {
    const res = await fetch(ENDPOINTS.sprints.create(projectId), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate
      }),
    });

    if (!res.ok) {
      let errorMessage = "Ошибка создания спринта";
      
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `Ошибка ${res.status}: ${res.statusText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    logger.success("Спринт успешно создан", { name: data.name, projectId });
  } catch (error) {
    logger.error("Ошибка при создании спринта", error);
    throw error;
  }
}

// Получение спринтов проекта
export async function getSprints(projectId: number): Promise<Sprint[]> {
  const token = StorageService.getAccessToken();
  
  logger.info("Получаем спринты проекта", { projectId });
  
  if (!token) {
    throw new Error("Токен авторизации не найден. Пожалуйста, войдите в систему.");
  }

  try {
    const res = await fetch(ENDPOINTS.sprints.list(projectId), {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      },
    });

    if (!res.ok) {
      let errorMessage = "Ошибка получения спринтов";
      
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `Ошибка ${res.status}: ${res.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    const sprints = await res.json();
    console.log("API ответ спринтов:", sprints);
    logger.success("Спринты успешно загружены", { projectId, count: sprints.length });
    return sprints;
  } catch (error) {
    logger.error("Ошибка при получении спринтов", error);
    throw error;
  }
}

// Обновление спринта
export async function updateSprint(projectId: number, sprintId: number, data: UpdateSprintRequest): Promise<void> {
  const token = StorageService.getAccessToken();
  
  logger.info("Обновляем спринт", { projectId, sprintId, name: data.name });
  
  if (!token) {
    throw new Error("Токен авторизации не найден. Пожалуйста, войдите в систему.");
  }

  try {
    const res = await fetch(ENDPOINTS.sprints.update(projectId, sprintId), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let errorMessage = "Ошибка обновления спринта";
      
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `Ошибка ${res.status}: ${res.statusText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    logger.success("Спринт успешно обновлен", { projectId, sprintId });
  } catch (error) {
    logger.error("Ошибка при обновлении спринта", error);
    throw error;
  }
}

// Удаление спринта

// доработать 
export async function deleteSprint(projectId: number, sprintId: number): Promise<void> {
  const token = StorageService.getAccessToken();
  
  logger.info("Удаляем спринт", { projectId, sprintId });
  
  if (!token) {
    throw new Error("Токен авторизации не найден. Пожалуйста, войдите в систему.");
  }

  try {
    const res = await fetch(ENDPOINTS.sprints.delete(projectId, sprintId), {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      },
    });

    if (!res.ok) {
      let errorMessage = "Ошибка удаления спринта";
      
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `Ошибка ${res.status}: ${res.statusText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    logger.success("Спринт успешно удален", { projectId, sprintId });
  } catch (error) {
    logger.error("Ошибка при удалении спринта", error);
    throw error;
  }
}
