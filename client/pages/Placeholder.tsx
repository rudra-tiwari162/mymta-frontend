import AppLayout from "@/components/app-layout";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface PlaceholderProps {
  title: string;
  description: string;
}

export default function Placeholder({ title, description }: PlaceholderProps) {
  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mb-8"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-lg border border-gray-200 p-8 sm:p-12 text-center">
          <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">{description}</p>

          <p className="text-sm text-gray-500">
            Continue asking in the chat to build out this page with real
            features.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
