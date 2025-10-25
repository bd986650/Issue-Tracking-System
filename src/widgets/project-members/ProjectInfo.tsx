"use client";

import { useState } from "react";
import { useProjectStore } from "@/entities/project";
import UniversalButton from "@/shared/ui/Buttons/UniversalButton";
import { UserPlus, Users } from "lucide-react";
import AddMemberModal from "./AddMemberModal";

export default function ProjectInfo() {
  const { selectedProject } = useProjectStore();
  const [showAddMember, setShowAddMember] = useState(false);

  if (!selectedProject) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Информация о проекте
        </h2>
        <UniversalButton
          onClick={() => setShowAddMember(true)}
          className="flex items-center gap-2"
        >
          <UserPlus size={16} />
          Добавить участника
        </UniversalButton>
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
          <h3 className="font-medium text-gray-900 mb-2">
            Участники ({(() => {
              const otherMembers = selectedProject.members?.filter(member => {
                // Если member - это строка, сравниваем напрямую
                if (typeof member === 'string') {
                  return member !== selectedProject.admin.email;
                }
                // Если member - это объект, сравниваем по email
                return member.email !== selectedProject.admin.email;
              }) || [];
              return `${otherMembers.length} + 1 админ`;
            })()})
          </h3>
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
            {(() => {
              // Проверяем структуру данных
              console.log("Admin email:", selectedProject.admin.email);
              console.log("All members:", selectedProject.members);
              console.log("First member type:", typeof selectedProject.members?.[0]);
              console.log("First member:", selectedProject.members?.[0]);
              
              const otherMembers = selectedProject.members?.filter(member => {
                // Если member - это строка, сравниваем напрямую
                if (typeof member === 'string') {
                  return member !== selectedProject.admin.email;
                }
                // Если member - это объект, сравниваем по email
                return member.email !== selectedProject.admin.email;
              }) || [];
              
              console.log("Filtered members:", otherMembers);
              
              return otherMembers.length > 0 ? otherMembers.map((member, index) => {
                // Определяем email в зависимости от типа данных
                const memberEmail = typeof member === 'string' ? member : member.email;
                const memberRoles = typeof member === 'object' ? member.roles : null;
                
                return (
                  <div key={typeof member === 'string' ? `member-${index}` : (member.id || `member-${index}`)} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                    <Users size={16} className="text-gray-400" />
                    <span className="text-sm">{memberEmail}</span>
                    <span className="text-xs text-gray-500">
                      ({memberRoles && Array.isArray(memberRoles) ? memberRoles.join(', ') : 'Участник'})
                    </span>
                  </div>
                );
              }) : (
                <div className="text-sm text-gray-500 italic">
                  Нет дополнительных участников
                </div>
              );
            })()}
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
