import { VideoUpload } from "@/app/_components/video-upload";

export default function UploadPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container flex flex-col items-center gap-8 px-4 py-16">
        <h1 className="text-4xl font-bold">Upload Video</h1>
        <VideoUpload />
      </div>
    </main>
  );
}
