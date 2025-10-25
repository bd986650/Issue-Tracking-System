import { LoginForm } from "@/app/(auth)/ui";
import AuthLayout from "@/shared/ui/layouts/AuthLayout";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Вход"
      form={<LoginForm />}
      linkText="Нет аккаунта?"
      linkHref="/register"
    />
  );
}