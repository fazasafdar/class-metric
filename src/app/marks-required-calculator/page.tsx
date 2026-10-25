import { MarksRequiredCalculator } from "@/components/calculators/MarksRequiredCalculator";

export default function MarksRequiredCalculatorPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Marks Required Calculator</h1>
      <p className="mt-2 mb-6 text-muted">Temporary preview page.</p>
      <MarksRequiredCalculator />
    </main>
  );
}