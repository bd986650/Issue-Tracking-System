"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/entities/project";
import { ProjectBaseUser } from "@/entities/project";
import { submitDeleteProject } from "@/features/project-management";
import UniversalButton from "@/shared/ui/Buttons/UniversalButton";
import { UserPlus, Users, Trash2 } from "lucide-react";
import AddMemberModal from "./AddMemberModal";

export default function ProjectInfo() {
  const { selectedProject, setSelectedProject } = useProjectStore();
  const router = useRouter();
  const [showAddMember, setShowAddMember] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!selectedProject) return null;

  const otherMembers = selectedProject.members?.filter(member => {
    if (typeof member === 'string') {
      return member !== selectedProject.admin.email;
    }
    return member.email !== selectedProject.admin.email;
  }) || [];

  const getMemberData = (member: ProjectBaseUser | string) => {
    const memberEmail = typeof member === 'string' ? member : member.email;
    const memberRoles = typeof member === 'object' ? member.roles : null;
    return { memberEmail, memberRoles };
  };

  const handleDeleteProject = async () => {
    if (!selectedProject?.id) return;

    const confirmed = window.confirm(
      `Вы уверены, что хотите удалить проект "${selectedProject.name}"?\n\nЭто действие нельзя отменить.`
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await submitDeleteProject(selectedProject.id);
      
      // Очищаем выбранный проект из хранилища
      setSelectedProject(null);
      
      // Перенаправляем на страницу выбора проекта
      router.push("/project-selector");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Ошибка при удалении проекта");
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Информация о проекте
        </h2>
        <div className="flex items-center gap-2">
          <UniversalButton
            onClick={() => setShowAddMember(true)}
            className="flex items-center gap-2"
          >
            <UserPlus size={16} />
            Добавить участника
          </UniversalButton>
          <UniversalButton
            onClick={handleDeleteProject}
            disabled={isDeleting}
            variant="outline"
            className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
          >
            <Trash2 size={16} />
            {isDeleting ? "Удаление..." : "Удалить проект"}
          </UniversalButton>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Название</h3>
          <p className="text-gray-600">{selectedProject.name}</p>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-2">Администратор</h3>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-gray-400" />
            <span className="text-gray-600">{selectedProject.admin.fullName}</span>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-2">Участники</h3>
          <div className="space-y-2">
            {/* Администратор */}
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
              <Users size={16} className="text-blue-500" />
              <span className="text-sm font-medium">{selectedProject.admin.email}</span>
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                Админ
              </span>
            </div>

            {/* Участники (исключая администратора) */}
            {otherMembers.length > 0 ? otherMembers.map((member, index) => {
              const { memberEmail, memberRoles } = getMemberData(member);

              return (
                <div key={typeof member === 'string' ? `member-${index}` : (member.id || `member-${index}`)} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                  <Users size={16} className="text-gray-400" />
                  <span className="text-sm">{memberEmail}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {/* ({memberRoles && Array.isArray(memberRoles) ? memberRoles.join(', ') : 'Участник'}) */}
                    Участник
                  </span>
                </div>
              );
            }) : (
              <div className="text-sm text-gray-500 italic">
                Нет дополнительных участников
              </div>
            )}
          </div>
        </div>
      </div>

      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
      />
    </div>
  );
}
