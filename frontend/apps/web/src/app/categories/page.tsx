import { CATEGORIES } from "@halyoontok/constants";

export default function CategoriesPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">الأقسام</h1>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.value}
            className="rounded-xl bg-gray-900 p-6 text-center"
          >
            <p className="text-lg font-semibold">{cat.labelAr}</p>
            <p className="mt-1 text-sm text-gray-400">{cat.label}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
