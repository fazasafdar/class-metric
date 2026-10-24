import { ClassAverageCalculator } from "@/components/calculators/ClassAverageCalculator";

export default function ClassAverageCalculatorPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Class Average Calculator</h1>
      <p className="mt-2 mb-6 text-muted">Temporary preview page.</p>
      <ClassAverageCalculator />
    </main>
  );
}