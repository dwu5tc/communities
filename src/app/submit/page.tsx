import { SubmitForm } from "@/components/submit-form";

export default function SubmitPage() {
  return (
    <div className="py-4">
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-gray-100">Submit a link</h1>
        <p className="mt-1 text-sm text-gray-500">
          Share content from YouTube, TikTok, or Instagram
        </p>
      </div>
      <SubmitForm />
    </div>
  );
}
