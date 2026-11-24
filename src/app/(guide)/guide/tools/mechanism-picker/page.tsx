import { MechanismPicker } from "./MechanismPicker";

export const metadata = { title: "Mechanism Picker — Built to Compete" };

export default function MechanismPickerPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="font-serif text-3xl font-semibold text-foreground">
        Intake & Outtake Picker
      </h1>

      <div className="mt-8">
        <MechanismPicker />
      </div>
    </div>
  );
}
