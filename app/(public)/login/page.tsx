import { Suspense } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthCard
      title="Accedi a EcoMemo"
      subtitle="Gestisci calendario rifiuti e promemoria dalla tua istanza."
      footer={
        <>
          Non hai un account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Registrati
          </Link>
        </>
      }
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
