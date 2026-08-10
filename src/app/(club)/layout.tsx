import { ClubHeader } from "@/components/club/ClubHeader";
import { ClubFooter } from "@/components/club/ClubFooter";

export default function ClubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="club flex min-h-full flex-1 flex-col">
      <ClubHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <ClubFooter />
    </div>
  );
}
