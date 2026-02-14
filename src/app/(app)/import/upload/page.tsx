import { FileUploadForm } from "@/components/app/import/file-upload-form";

export default function UploadPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Upload Data File</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Upload a CSV or Excel file and AI will analyze the columns, suggest mappings,
          and recommend the best category structure for your church
        </p>
      </div>

      <FileUploadForm />
    </div>
  );
}
