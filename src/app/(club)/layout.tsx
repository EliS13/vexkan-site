export default function ClubLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="flex-1">
      {children}
    </main>
  );
}
