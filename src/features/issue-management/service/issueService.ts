import { 
  createIssue as createIssueApi,
  getIssues as getIssuesApi,
  updateIssue as updateIssueApi,
  deleteIssue as deleteIssueApi,
  changeIssueStatus as changeIssueStatusApi,
  searchIssues as searchIssuesApi,
  getIssueHistory as getIssueHistoryApi
} from "../api/issueApi";
import { 
  CreateIssueRequest, 
  UpdateIssueRequest, 
  SearchIssuesRequest,
  Issue,
  IssueHistory 
} from "../model/issueTypes";
import { logger } from "@/shared/utils/logger";

// Создание задачи
export async function submitCreateIssue(projectId: number, data: CreateIssueRequest): Promise<void> {
  try {
    await createIssueApi(projectId, data);
    logger.success("Задача успешно создана", { projectId, title: data.title });
  } catch (err: unknown) {
    logger.error("Ошибка создания задачи", err);
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}

// Получение задач проекта
export async function fetchIssues(projectId: number): Promise<Issue[]> {
  try {
    const issues = await getIssuesApi(projectId);
    
    // Маппинг API ответа в формат Issue
    const mappedIssues = issues.map(issue => ({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type || 'BUG', // Если type null, используем BUG по умолчанию
      status: issue.status,
      priority: issue.priority,
      assignee: issue.assigneeEmail ? {
        id: issue.assigneeEmail,
        email: issue.assigneeEmail,
        fullName: issue.assigneeEmail.split('@')[0]
      } : undefined,
      creator: {
        id: issue.authorEmail,
        email: issue.authorEmail,
        fullName: issue.authorEmail.split('@')[0]
      },
      startDate: issue.startDate,
      endDate: issue.endDate,
      sprint: issue.sprintId ? {
        id: issue.sprintId,
        name: `Sprint ${issue.sprintId}` // Временное решение, нужно получать имя спринта
      } : undefined
    }));
    
    logger.success("Задачи успешно загружены", { projectId, count: mappedIssues.length });
    return mappedIssues;
  } catch (err: unknown) {
    logger.error("Ошибка загрузки задач", err);
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}

// Обновление задачи
export async function submitUpdateIssue(projectId: number, issueId: number, data: UpdateIssueRequest): Promise<void> {
  try {
    await updateIssueApi(projectId, issueId, data);
    logger.success("Задача успешно обновлена", { projectId, issueId });
  } catch (err: unknown) {
    logger.error("Ошибка обновления задачи", err);
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}

// Удаление задачи
export async function submitDeleteIssue(projectId: number, issueId: number): Promise<void> {
  try {
    await deleteIssueApi(projectId, issueId);
    logger.success("Задача успешно удалена", { projectId, issueId });
  } catch (err: unknown) {
    logger.error("Ошибка удаления задачи", err);
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}

// Изменение статуса задачи
export async function submitChangeIssueStatus(
  projectId: number, 
  issueId: number, 
  action: 'test' | 'progress' | 'done' | 'open'
): Promise<void> {
  try {
    await changeIssueStatusApi(projectId, issueId, action);
    logger.success("Статус задачи успешно изменен", { projectId, issueId, action });
  } catch (err: unknown) {
    logger.error("Ошибка изменения статуса задачи", err);
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}

// Поиск задач
export async function submitSearchIssues(projectId: number, data: SearchIssuesRequest): Promise<Issue[]> {
  try {
    const issues = await searchIssuesApi(projectId, data);
    logger.success("Поиск задач выполнен", { projectId, count: issues.length });
    return issues;
  } catch (err: unknown) {
    logger.error("Ошибка поиска задач", err);
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}

// Получение истории задачи
export async function fetchIssueHistory(projectId: number, issueId: number): Promise<IssueHistory[]> {
  try {
    const history = await getIssueHistoryApi(projectId, issueId);
    logger.success("История задачи загружена", { projectId, issueId, count: history.length });
    return history;
  } catch (err: unknown) {
    logger.error("Ошибка загрузки истории задачи", err);
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}
