import { LoginPanel } from "@/components/auth/login-panel";
import { LoginShowcase } from "@/components/auth/login-showcase";
import { FlashBanner } from "@/components/kickoff/flash-banner";
import { Logo } from "@/components/kickoff/logo";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; flash?: string; magic?: string };
}) {
  return (
    <div className="login-page relative min-h-screen overflow-hidden bg-base">
      <div className="pointer-events-none fixed inset-0 grid-pitch opacity-50" />
      <div className="pointer-events-none fixed inset-0 landing-aurora" />
      <div className="pointer-events-none fixed inset-0 landing-pitch-lines opacity-30" />
      <div className="pointer-events-none fixed inset-0 landing-vignette" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
        <div className="hidden lg:block">
          <LoginShowcase />
        </div>

        <div className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-14">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          {searchParams.flash && (
            <div className="mx-auto mb-4 w-full max-w-md">
              <FlashBanner flash={searchParams.flash} />
            </div>
          )}
          <div className="mx-auto w-full">
            <LoginPanel error={searchParams.error} magic={searchParams.magic} />
          </div>
        </div>
      </div>
    </div>
  );
}
