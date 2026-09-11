import { Logo } from "@/components/app-shell/logo";
import { Card, CardContent } from "@/components/ui/card";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 w-fit">
          <Logo size={32} />
        </div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <Card>
        <CardContent className="pt-6">{children}</CardContent>
      </Card>
      <p className="mt-5 text-center text-[13px] text-muted-foreground">{footer}</p>
    </div>
  );
}
