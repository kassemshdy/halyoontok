import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex h-full flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">HalyoonTok</h1>
      <p className="mt-2 text-gray-400">فيديوهات قصيرة آمنة للأطفال</p>
      <Link
        href="/feed"
        className="mt-6 rounded-full bg-white px-8 py-3 font-semibold text-black"
      >
        شاهد الآن
      </Link>
    </main>
  );
}
