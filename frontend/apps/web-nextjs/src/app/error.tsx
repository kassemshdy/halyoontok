"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-black text-white">
      <p className="text-lg font-semibold">Something went wrong</p>
      <p className="mt-2 text-sm text-gray-400">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 rounded-lg bg-white px-6 py-2 font-medium text-black"
      >
        Try again
      </button>
    </div>
  );
}
