interface DetailsModalProps {
  open: boolean;
  details: any[];
  onClose: () => void;
}

export default function DetailsModal({
  open,
  details,
  onClose,
}: DetailsModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Change Details</h2>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 max-h-[65vh]">
          {details && details.length > 0 ? (
            details.map((item) => (
              <div
                key={item.type}
                className="border rounded-lg p-4 bg-gray-50 shadow-sm space-y-2"
              >
                <DetailRow label="Type" value={item.type} />
                <DetailRow label="Action" value={item.action} />

                {item.oldValue && (
                  <DetailRow label="Old Value" value={item.oldValue} long />
                )}

                {item.newValue && (
                  <DetailRow label="New Value" value={item.newValue} long />
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No details available.</p>
          )}
        </div>

      </div>
    </div>
  );
}

/* Helper Component */
function DetailRow({
  label,
  value,
  long = false,
}: {
  label: string;
  value: any;
  long?: boolean;
}) {
  return (
    <div>
      <span className="font-medium text-gray-800">{label}:</span>
      <p
        className={`text-gray-700 mt-1 ${
          long ? "whitespace-pre-wrap break-words break-all" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
