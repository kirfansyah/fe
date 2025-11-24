import { BookOpen } from "lucide-react";

export default function EbookDescription({ ebook, onClose, onReadEbook }) {
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date
      .toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header with Breadcrumb (Inline) */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white py-4 px-6">
        <h1 className="text-3xl font-bold">{ebook.title}</h1>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Ebook Info Card */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-6">
              {/* Cover Image */}
              <div className="w-full">
                {ebook.cover_image_url ? (
                  <img
                    src={ebook.cover_image_url}
                    alt={ebook.title}
                    className="w-full h-auto object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <BookOpen size={48} className="mx-auto mb-2" />
                      <div className="text-xs">No Cover</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Ebook Details */}
              <div className="p-4">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 text-gray-600 align-top">Category</td>
                      <td className="py-2 text-right font-medium text-gray-900 align-top">
                        {ebook.id_category || "Umum"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 text-gray-600 align-top">
                        Sub Category
                      </td>
                      <td className="py-2 text-right font-medium text-gray-900 align-top">
                        {ebook.sub_category || "Kelapa"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 text-gray-600 align-top">Author</td>
                      <td className="py-2 text-right font-medium text-gray-900 align-top">
                        {ebook.author || "Prof. Dr. F.G Winarno"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 text-gray-600 align-top whitespace-nowrap">
                        Number of Page
                      </td>
                      <td className="py-2 text-right font-medium text-gray-900 align-top">
                        {ebook.total_pages || 43}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 text-gray-600 align-top">
                        Upload By
                      </td>
                      <td className="py-2 text-right font-medium text-gray-900 align-top">
                        {ebook.upload_by || ebook.created_by || "Annisa Karim"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 text-gray-600 align-top whitespace-nowrap">
                        Upload Date
                      </td>
                      <td className="py-2 text-right font-medium text-gray-900 align-top">
                        {formatDate(ebook.upload_date || ebook.created_at)}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 text-gray-600 align-top">Rating</td>
                      <td className="py-2 text-right font-medium text-gray-900 align-top">
                        {ebook.rating || "4.5"} / 5
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 text-gray-600 align-top">
                        Total Read
                      </td>
                      <td className="py-2 text-right font-medium text-gray-900 align-top">
                        {ebook.total_read || 301}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-600 align-top whitespace-nowrap">
                        Total Reading Hours
                      </td>
                      <td className="py-2 text-right font-medium text-gray-900 align-top">
                        {ebook.total_reading_hours ||
                          ebook.total_time ||
                          "150.5"}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Action Buttons */}
                <div className="mt-4 space-y-2">
                  <button
                    onClick={onReadEbook}
                    className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                  >
                    Read eBook
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full px-4 py-2.5 bg-cyan-400 text-white text-sm font-medium rounded hover:bg-cyan-500 transition-colors"
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Description */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  E-Book Description
                </h2>
              </div>

              {/* Description Content */}
              <div className="px-6 py-6">
                {ebook.description ? (
                  <div
                    className="text-gray-700 text-[15px] leading-relaxed [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_p]:mb-4"
                    dangerouslySetInnerHTML={{ __html: ebook.description }}
                  />
                ) : (
                  <div className="text-gray-700 text-[15px] leading-relaxed space-y-4">
                    <p>
                      <strong>No Description</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
