import { 
  submitCreateSprint as createSprintFeature,
  fetchSprints as getSprintsFeature,
  submitUpdateSprint as updateSprintFeature,
  submitDeleteSprint as deleteSprintFeature
} from "@/features/sprint-management";
import { 
  CreateSprintRequest, 
  UpdateSprintRequest, 
  Sprint 
} from "@/features/sprint-management/model/sprintTypes";

// Прокси функции для совместимости - делегируют вызовы в features/sprint-management
export async function submitCreateSprint(projectId: number, data: CreateSprintRequest): Promise<void> {
  return createSprintFeature(projectId, data);
}

export async function fetchSprints(projectId: number): Promise<Sprint[]> {
  return getSprintsFeature(projectId);
}

export async function submitUpdateSprint(projectId: number, sprintId: number, data: UpdateSprintRequest): Promise<void> {
  return updateSprintFeature(projectId, sprintId, data);
}

export async function submitDeleteSprint(projectId: number, sprintId: number): Promise<void> {
  return deleteSprintFeature(projectId, sprintId);
}