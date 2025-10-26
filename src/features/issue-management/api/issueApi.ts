import { ENDPOINTS } from "@/shared/config/api";
import { StorageService } from "@/shared/services/storageService";
import { logger } from "@/shared/utils/logger";
import { 
  Issue, 
  CreateIssueRequest, 
  UpdateIssueRequest, 
  SearchIssuesRequest, 
  IssueHistory,
  IssueApiResponse
} from "../model/issueTypes";

// Создание задачи
export async function createIssue(projectId: number, data: CreateIssueRequest): Promise<void> {
  const token = StorageService.getAccessToken();
    
  if (!token) {
    throw new Error("Токен авторизации не найден. Пожалуйста, войдите в систему.");
  }

  try {
    const res = await fetch(ENDPOINTS.issues.create(projectId), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let errorMessage = "Ошибка создания задачи";
      
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `Ошибка ${res.status}: ${res.statusText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    logger.success("Задача успешно создана", { projectId, title: data.title });
  } catch (error) {
    logger.error("Ошибка при создании задачи", error);
    throw error;
  }
}

// Получение всех задач проекта
export async function getIssues(projectId: number): Promise<IssueApiResponse[]> {
  const token = StorageService.getAccessToken();
  
  logger.info("Получаем задачи проекта", { projectId });
  
  if (!token) {
    throw new Error("Токен авторизации не найден. Пожалуйста, войдите в систему.");
  }

  try {
    const res = await fetch(ENDPOINTS.issues.list(projectId), {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      },
    });

    if (!res.ok) {
      let errorMessage = "Ошибка получения задач";
      
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `Ошибка ${res.status}: ${res.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    const issues = await res.json();
    logger.success("Задачи успешно загружены", { projectId, count: issues.length });
    return issues;
  } catch (error) {
    logger.error("Ошибка при получении задач", error);
    throw error;
  }
}

// Обновление задачи
export async function updateIssue(projectId: number, issueId: number, data: UpdateIssueRequest): Promise<void> {
  const token = StorageService.getAccessToken();
  
  logger.info("Обновляем задачу", { projectId, issueId, title: data.title });
  
  if (!token) {
    throw new Error("Токен авторизации не найден. Пожалуйста, войдите в систему.");
  }

  try {
    const res = await fetch(ENDPOINTS.issues.update(projectId, issueId), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let errorMessage = "Ошибка обновления задачи";
      
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `Ошибка ${res.status}: ${res.statusText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    logger.success("Задача успешно обновлена", { projectId, issueId });
  } catch (error) {
    logger.error("Ошибка при обновлении задачи", error);
    throw error;
  }
}

// Удаление задачи
export async function deleteIssue(projectId: number, issueId: number): Promise<void> {
  const token = StorageService.getAccessToken();
  
  logger.info("Удаляем задачу", { projectId, issueId });
  
  if (!token) {
    throw new Error("Токен авторизации не найден. Пожалуйста, войдите в систему.");
  }

  try {
    const res = await fetch(ENDPOINTS.issues.delete(projectId, issueId), {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      },
    });

    if (!res.ok) {
      let errorMessage = "Ошибка удаления задачи";
      
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `Ошибка ${res.status}: ${res.statusText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    logger.success("Задача успешно удалена", { projectId, issueId });
  } catch (error) {
    logger.error("Ошибка при удалении задачи", error);
    throw error;
  }
}

// Изменение статуса задачи
export async function changeIssueStatus(
  projectId: number, 
  issueId: number, 
  action: 'test' | 'progress' | 'done' | 'open'
): Promise<void> {
  const token = StorageService.getAccessToken();
  
  logger.info("Изменяем статус задачи", { projectId, issueId, action });
  
  if (!token) {
    throw new Error("Токен авторизации не найден. Пожалуйста, войдите в систему.");
  }

  try {
    const res = await fetch(ENDPOINTS.issues.changeStatus(projectId, issueId, action), {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`
      },
    });

    if (!res.ok) {
      let errorMessage = "Ошибка изменения статуса задачи";
      
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `Ошибка ${res.status}: ${res.statusText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    logger.success("Статус задачи успешно изменен", { projectId, issueId, action });
  } catch (error) {
    logger.error("Ошибка при изменении статуса задачи", error);
    throw error;
  }
}

// Поиск задач
export async function searchIssues(projectId: number, data: SearchIssuesRequest): Promise<Issue[]> {
  const token = StorageService.getAccessToken();
  
  logger.info("Ищем задачи", { projectId, filters: data });
  
  if (!token) {
    throw new Error("Токен авторизации не найден. Пожалуйста, войдите в систему.");
  }

  try {
    const queryParams = new URLSearchParams();
    if (data.status) queryParams.append('status', data.status);
    if (data.assigneeEmail) queryParams.append('assigneeEmail', data.assigneeEmail);
    if (data.sprintId) queryParams.append('sprintId', data.sprintId.toString());

    const res = await fetch(ENDPOINTS.issues.search(projectId), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let errorMessage = "Ошибка поиска задач";
      
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `Ошибка ${res.status}: ${res.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    const issues = await res.json();
    logger.success("Поиск задач выполнен", { projectId, count: issues.length });
    return issues;
  } catch (error) {
    logger.error("Ошибка при поиске задач", error);
    throw error;
  }
}

// Получение истории изменений задачи
export async function getIssueHistory(projectId: number, issueId: number): Promise<IssueHistory[]> {
  const token = StorageService.getAccessToken();
  
  logger.info("Получаем историю задачи", { projectId, issueId });
  
  if (!token) {
    throw new Error("Токен авторизации не найден. Пожалуйста, войдите в систему.");
  }

  try {
    const res = await fetch(ENDPOINTS.issues.history(projectId, issueId), {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      },
    });

    if (!res.ok) {
      let errorMessage = "Ошибка получения истории задачи";
      
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `Ошибка ${res.status}: ${res.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    const history = await res.json();
    logger.success("История задачи загружена", { projectId, issueId, count: history.length });
    return history;
  } catch (error) {
    logger.error("Ошибка при получении истории задачи", error);
    throw error;
  }
}
