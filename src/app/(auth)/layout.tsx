import { BrandMark } from "@/components/brand-mark";
import { APP_TAGLINE } from "@/lib/config";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <BrandMark />
          <p className="text-muted-foreground max-w-xs text-sm text-pretty">
            {APP_TAGLINE}
          </p>
        </div>
        {children}
      </div>
    </main>
  );
}
