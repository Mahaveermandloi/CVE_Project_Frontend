import { deleteCveChange } from "../pages/api/APICalls";

interface DeleteCveModalProps {
  open: boolean;
  id: number | null;
  cveId: string | null;
  onClose: () => void;
  onDeleted: () => void;
}
export default function DeleteCveModal({
  open,
  id,
  cveId,
  onClose,
  onDeleted,
}: DeleteCveModalProps) {
  if (!open || !id) return null;

  const handleDelete = async () => {
    await deleteCveChange(id);
    onDeleted();
  };

  return (
    <div className="fixed inset-0  z-10 shadow-xl bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-xl w-[350px]">
        <h2 className="text-lg font-bold mb-3">Confirm Delete ?</h2>

        <p>
          {" "}
          CVE ID :
          <span className="text-red-500 font-bold"> {cveId}</span>
        </p>

        <p className="mb-6">Are you sure you want to delete this record?</p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="px-4 py-2 bg-red-600 text-white rounded"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
