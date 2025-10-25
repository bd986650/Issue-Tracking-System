"use client";

import { useProjectStore } from "@/entities/project";
import ProjectInfo from "@/widgets/project-members/ProjectInfo";

export default function MembersPage() {
  const { selectedProject } = useProjectStore();

  if (!selectedProject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-700">Проект не выбран</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Участники проекта</h1>
          <p className="text-gray-600 mt-1">Управление участниками проекта: {selectedProject.name}</p>
        </div>

        <ProjectInfo />
      </div>
    </div>
  );
}
