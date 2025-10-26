import { 
  createProject as createProjectApi,
  getProjects as getProjectsApi,
  addProjectMember as addProjectMemberApi
} from "../api/projectApi";
import { CreateProjectRequest, ProjectResponse, AddMemberRequest } from "../model/projectTypes";
import { logger } from "@/shared/utils/logger";

// Создание проекта
export async function submitCreateProject(data: CreateProjectRequest): Promise<void> {
  try {
    await createProjectApi(data);
    logger.success("Проект успешно создан", { name: data.name });
  } catch (err: unknown) {
    logger.error("Ошибка создания проекта", err);
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}

// Получение списка проектов
export async function fetchProjects(): Promise<ProjectResponse[]> {
  try {
    const projects = await getProjectsApi();
    logger.success("Проекты успешно загружены", { count: projects.length });
    return projects;
  } catch (err: unknown) {
    logger.error("Ошибка загрузки проектов", err);
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}

// Добавление участника в проект
export async function submitAddProjectMember(projectId: number, data: AddMemberRequest): Promise<void> {
  try {
    await addProjectMemberApi(projectId, data);
    logger.success("Участник успешно добавлен", { projectId, memberEmail: data.memberEmail });
  } catch (err: unknown) {
    logger.error("Ошибка добавления участника", err);
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}
