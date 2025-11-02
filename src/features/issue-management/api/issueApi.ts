import { ENDPOINTS } from "@/shared/config/api";
import { StorageService } from "@/shared/services/storageService";
import { apiFetch } from "@/shared/services/apiClient";
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
  try {
    const res = await apiFetch(ENDPOINTS.issues.create(projectId), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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

// Получение задач проекта по спринту
export async function getIssuesBySprint(projectId: number, sprintId: number): Promise<IssueApiResponse[]> {
  try {
    const res = await apiFetch(ENDPOINTS.issues.bySprint(projectId, sprintId), {
      method: "GET",
    });

    if (!res.ok) {
      let errorMessage = "Ошибка получения задач по спринту";
      
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `Ошибка ${res.status}: ${res.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    const issues = await res.json();
    logger.success("Задачи по спринту успешно загружены", { projectId, sprintId, count: issues.length });
    return issues;
  } catch (error) {
    logger.error("Ошибка при получении задач по спринту", error);
    throw error;
  }
}

// Получение всех задач проекта
export async function getIssues(projectId: number): Promise<IssueApiResponse[]> {
  try {
    const res = await apiFetch(ENDPOINTS.issues.list(projectId), {
      method: "GET",
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
  const url = ENDPOINTS.issues.update(projectId, issueId);
  
  // Проверяем, что ID валидны
  if (!projectId || !issueId) {
    throw new Error(`Некорректные ID: projectId=${projectId}, issueId=${issueId}`);
  }

  // Валидация обязательных полей
  if (!data.title || !data.description || !data.type) {
    throw new Error("Обязательные поля не заполнены: title, description, type");
  }

  // Удаляем пустые строки и undefined значения из данных
  const cleanData: any = {
    title: data.title.trim(),
    description: data.description.trim(),
    type: data.type,
  };

  if (data.status) {
    cleanData.status = data.status;
  }
  if (data.priority) {
    cleanData.priority = data.priority;
  }
  if (data.assigneeEmail && data.assigneeEmail.trim() !== '') {
    cleanData.assigneeEmail = data.assigneeEmail.trim();
  }
  if (data.startDate && data.startDate.trim() !== '') {
    cleanData.startDate = data.startDate.trim();
  }
  if (data.endDate && data.endDate.trim() !== '') {
    cleanData.endDate = data.endDate.trim();
  }
  if (data.sprintId !== undefined && data.sprintId !== null && !isNaN(Number(data.sprintId))) {
    cleanData.sprintId = Number(data.sprintId);
  }

  logger.info("Обновление задачи", { 
    url, 
    projectId, 
    issueId, 
    originalData: data,
    cleanData 
  });

  try {
    const res = await apiFetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cleanData),
    });

    if (!res.ok) {
      let errorMessage = "Ошибка обновления задачи";
      let errorBody = null;
      
      try {
        errorBody = await res.json();
        errorMessage = errorBody.message || errorBody.error || errorMessage;
      } catch {
        // Пытаемся получить текст ошибки
        try {
          const text = await res.text();
          if (text) {
            errorBody = { raw: text };
            errorMessage = text || errorMessage;
          }
        } catch {
          errorMessage = `Ошибка ${res.status}: ${res.statusText}`;
        }
      }
      
      logger.error("Ошибка обновления задачи", { 
        status: res.status, 
        statusText: res.statusText,
        url,
        projectId,
        issueId,
        requestData: cleanData,
        errorBody
      });
      
      // Более информативное сообщение для 404
      if (res.status === 404) {
        if (errorBody?.raw && errorBody.raw.toLowerCase().includes('user')) {
          errorMessage = `Пользователь не найден. ${errorBody.raw}`;
        } else {
          errorMessage = `Задача с ID ${issueId} не найдена в проекте ${projectId}. Возможно, она была удалена или не существует.`;
          if (errorBody?.message) {
            errorMessage = errorBody.message;
          }
        }
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
  // Проверяем, что ID валидны
  if (!projectId || !issueId || isNaN(projectId) || isNaN(issueId)) {
    throw new Error(`Некорректные ID: projectId=${projectId}, issueId=${issueId}`);
  }

  const url = ENDPOINTS.issues.delete(projectId, issueId);
  logger.info("Удаление задачи", { url, projectId, issueId });

  try {
    const res = await apiFetch(url, {
      method: "DELETE",
    });

    if (!res.ok) {
      let errorMessage = "Ошибка удаления задачи";
      let errorBody = null;
      
      try {
        errorBody = await res.json();
        errorMessage = errorBody.message || errorBody.error || errorMessage;
      } catch {
        // Пытаемся получить текст ошибки
        try {
          const text = await res.text();
          if (text) {
            errorBody = { raw: text };
            errorMessage = text || errorMessage;
          }
        } catch {
          errorMessage = `Ошибка ${res.status}: ${res.statusText}`;
        }
      }
      
      logger.error("Ошибка удаления задачи", { 
        status: res.status, 
        statusText: res.statusText,
        url,
        projectId,
        issueId,
        errorBody
      });
      
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
  try {
    const res = await apiFetch(ENDPOINTS.issues.changeStatus(projectId, issueId, action), {
      method: "PUT",
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
  try {
    const queryParams = new URLSearchParams();
    if (data.status) queryParams.append('status', data.status);
    if (data.assigneeEmail) queryParams.append('assigneeEmail', data.assigneeEmail);
    if (data.sprintId) queryParams.append('sprintId', data.sprintId.toString());

    const res = await apiFetch(ENDPOINTS.issues.search(projectId), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
  const url = ENDPOINTS.issues.history(projectId, issueId);
  logger.info("Запрос истории задачи", { url, projectId, issueId });

  try {
    const res = await apiFetch(url, {
      method: "GET",
    });

    if (!res.ok) {
      let errorMessage = "Ошибка получения истории задачи";
      
      // Специальная обработка для 403
      if (res.status === 403) {
        errorMessage = "У вас нет доступа к истории этой задачи. Возможно, у вас недостаточно прав.";
        
        try {
          const errorData = await res.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // Если не удалось распарсить JSON, используем стандартное сообщение
        }
      } else {
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Ошибка ${res.status}: ${res.statusText}`;
        }
      }
      
      logger.error("Ошибка получения истории", { 
        status: res.status, 
        statusText: res.statusText,
        projectId, 
        issueId,
        url 
      });
      
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
