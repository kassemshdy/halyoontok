interface VideoPageProps {
  params: Promise<{ id: string }>;
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params;

  return (
    <main className="flex h-full flex-col items-center justify-center">
      <p className="text-gray-400">Video {id}</p>
      {/* TODO: Single video view with metadata, sharing */}
    </main>
  );
}
