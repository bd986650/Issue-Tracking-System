import ProjectInfo from "@/widgets/project-members/ProjectInfo";

export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Дашборд</h1>
        <p className="text-gray-600">Добро пожаловать в систему управления задачами</p>
      </div>
      
      <ProjectInfo />
    </div>
  );
}