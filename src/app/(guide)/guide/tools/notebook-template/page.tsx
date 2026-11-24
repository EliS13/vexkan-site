import { NotebookTemplate } from "./NotebookTemplate";

export const metadata = { title: "Notebook Template — Built to Compete" };

export default function NotebookTemplatePage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-serif text-3xl font-semibold text-foreground">
        Engineering Notebook
      </h1>

      <div className="mt-8">
        <NotebookTemplate />
      </div>
    </div>
  );
}
