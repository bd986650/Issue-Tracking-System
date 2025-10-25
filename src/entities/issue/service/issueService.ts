import { 
  submitCreateIssue as createIssueFeature,
  fetchIssues as getIssuesFeature,
  submitUpdateIssue as updateIssueFeature,
  submitDeleteIssue as deleteIssueFeature,
  submitSearchIssues as searchIssuesFeature,
  submitChangeIssueStatus as changeIssueStatusFeature,
  fetchIssueHistory as getIssueHistoryFeature
} from "@/features/issue-management";

import { 
  CreateIssueRequest, 
  UpdateIssueRequest, 
  SearchIssuesRequest, 
  Issue, 
  IssueHistory 
} from "../model/types";

// Прокси функции для совместимости - делегируют вызовы в features/issue-management
export async function submitCreateIssue(projectId: number, data: CreateIssueRequest): Promise<void> {
  return createIssueFeature(projectId, data);
}

export async function fetchIssues(projectId: number): Promise<Issue[]> {
  return getIssuesFeature(projectId);
}

export async function fetchIssuesBySprint(projectId: number): Promise<Issue[]> {
  // Пока используем общий поиск, можно добавить специальную функцию в фичу
  return getIssuesFeature(projectId);
}

export async function submitUpdateIssue(projectId: number, issueId: number, data: UpdateIssueRequest): Promise<void> {
  return updateIssueFeature(projectId, issueId, data);
}

export async function submitDeleteIssue(projectId: number, issueId: number): Promise<void> {
  return deleteIssueFeature(projectId, issueId);
}

export async function submitSearchIssues(projectId: number, data: SearchIssuesRequest): Promise<Issue[]> {
  return searchIssuesFeature(projectId, data);
}

export async function submitChangeIssueStatus(
  projectId: number, 
  issueId: number, 
  action: 'test' | 'progress' | 'done' | 'open'
): Promise<void> {
  return changeIssueStatusFeature(projectId, issueId, action);
}

export async function fetchIssueHistory(projectId: number, issueId: number): Promise<IssueHistory[]> {
  return getIssueHistoryFeature(projectId, issueId);
}