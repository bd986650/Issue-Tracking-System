"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchProjects, submitCreateProject, selectProject } from "@/entities/project/service/projectService";
import { Project } from "@/entities/project";
import UniversalButton from "@/shared/ui/Buttons/UniversalButton";
import TextInput from "@/shared/ui/inputs/TextInput";
import LogoutButton from "@/shared/ui/Buttons/LogoutButton";
import ProjectSlider from "@/widgets/project-selector/ProjectSlider";

export default function ProjectSelectorPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await fetchProjects();
      setProjects(projectsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки проектов");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    try {
      setCreating(true);
      setError("");
      
      // Проверяем токен перед отправкой
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Токен авторизации не найден. Пожалуйста, войдите в систему заново.");
        return;
      }
      
      await submitCreateProject({ name: projectName.trim() });
      await loadProjects(); // Перезагружаем список проектов
      setProjectName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка создания проекта");
    } finally {
      setCreating(false);
    }
  };

  const handleSelectProject = (project: Project) => {
    if (!project.id) {
      setError("Ошибка: проект не имеет корректного ID");
      return;
    }
    selectProject(project);
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка проектов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col">
      <div className="max-w-4xl mx-auto flex-1 flex flex-col justify-between">
        <div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Выберите проект
          </h1>
          <p className="text-gray-600">
            Выберите существующий проект или создайте новый
          </p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Создание нового проекта */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Создать новый проект
            </h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <TextInput
                label="Название проекта"
                value={projectName}
                onChange={(value) => setProjectName(value as string)}
                placeholder="Введите название проекта"
                required
                minLength={3}
                maxLength={100}
              />
              <UniversalButton
                type="submit"
                disabled={creating || !projectName.trim()}
                className="w-full"
              >
                {creating ? "Создание..." : "Создать проект"}
              </UniversalButton>
            </form>
          </div>

          {/* Список существующих проектов */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Мои проекты
            </h2>
            <ProjectSlider 
              projects={projects} 
              onSelectProject={handleSelectProject}
            />
          </div>
        </div>
        </div>

        {/* Кнопка logout внизу страницы */}
        <div className="mt-8">
          <LogoutButton className="w-full bg-black text-white" centered={true} />
        </div>
      </div>
    </div>
  );
}
