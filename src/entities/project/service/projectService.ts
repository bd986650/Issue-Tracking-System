import { 
  submitCreateProject as createProjectFeature,
  fetchProjects as getProjectsFeature,
  submitAddProjectMember as addProjectMemberFeature
} from "@/features/project-management";

import { CreatingProjectRequest, Project } from "../model/types";
import { useProjectStore } from "../model/projectStore";

export async function submitCreateProject(data: CreatingProjectRequest): Promise<void> {
  return createProjectFeature(data);
}

export async function fetchProjects(): Promise<Project[]> {
  const projectResponses = await getProjectsFeature();
  
  // Маппинг ProjectResponse[] в Project[]
  return projectResponses.map(response => ({
    id: response.id,
    name: response.name,
    admin: {
      id: response.adminEmail, // Используем email как id
      email: response.adminEmail,
      fullName: response.adminEmail.split('@')[0], // Извлекаем имя из email
      roles: response.isAdmin ? ['ADMIN'] : []
    },
    members: response.members.map(memberEmail => ({
      id: memberEmail,
      email: memberEmail,
      fullName: memberEmail.split('@')[0], // Извлекаем имя из email
      roles: []
    }))
  }));
}

export async function submitAddProjectMember(projectId: number, memberEmail: string): Promise<void> {
  return addProjectMemberFeature(projectId, { memberEmail });
}

export function selectProject(project: Project): void {
  useProjectStore.getState().setSelectedProject(project);
}

export function getSelectedProject(): Project | null {
  return useProjectStore.getState().selectedProject;
}

export function clearSelectedProject(): void {
  useProjectStore.getState().setSelectedProject(null);
}
