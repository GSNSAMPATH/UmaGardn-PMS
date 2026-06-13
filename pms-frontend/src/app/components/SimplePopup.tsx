export default function SimplePopup({ title, message, onClose, error }: any) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[360px]">
        <h2 className={`text-lg font-semibold ${error ? "text-red-600" : "text-green-600"}`}>
          {title}
        </h2>
        <p className="text-gray-700 my-4">{message}</p>
        <div className="flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-900 text-white rounded">
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
