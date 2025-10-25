"use client";

import { useState, useEffect, useCallback } from "react";
import { useProjectStore } from "@/entities/project";
import { useSprintStore } from "@/entities/sprint";
import { submitCreateSprint } from "@/features/sprint-management";
import { fetchSprints } from "@/entities/sprint";
import { CreateSprintRequest } from "@/features/sprint-management/model/sprintTypes";
import SprintCard from "@/widgets/sprints/SprintCard";
import CreateSprintModal from "@/widgets/sprints/CreateSprintModal";
import UniversalButton from "@/shared/ui/Buttons/UniversalButton";
import { Plus } from "lucide-react";

export default function SprintsPage() {
  const { selectedProject } = useProjectStore();
  const { sprints, setSprints } = useSprintStore();
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState("");

  const loadSprints = useCallback(async () => {
    if (!selectedProject) return;
    
    try {
      setLoading(true);
      const sprintsData = await fetchSprints(selectedProject.id);
      setSprints(sprintsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки спринтов");
    } finally {
      setLoading(false);
    }
  }, [selectedProject, setSprints]);

  useEffect(() => {
    if (selectedProject) {
      loadSprints();
    }
  }, [selectedProject, loadSprints]);

  const handleCreateSprint = async (data: CreateSprintRequest) => {
    if (!selectedProject) return;
    
    console.log("🔍 SprintsPage: Создаем спринт", {
      projectId: selectedProject.id,
      sprintData: data,
      projectName: selectedProject.name
    });
    
    try {
      await submitCreateSprint(selectedProject.id, data);
      await loadSprints(); // Перезагружаем список
    } catch (err) {
      throw err; // Ошибка будет обработана в модальном окне
    }
  };

  if (!selectedProject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-700">Проект не выбран</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-700">Загрузка спринтов...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Спринты</h1>
            <p className="text-gray-600 mt-1">Проект: {selectedProject.name}</p>
          </div>
          
          <UniversalButton
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Создать спринт
          </UniversalButton>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {sprints.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Спринтов пока нет</p>
            <p className="text-gray-400 mt-2">Создайте первый спринт для планирования работы</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sprints.map((sprint, index) => (
              <SprintCard
                key={sprint.id || index}
                sprint={sprint}
              />
            ))}
          </div>
        )}

        <CreateSprintModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateSprint}
        />
      </div>
    </div>
  );
}