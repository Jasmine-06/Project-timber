import { Search, MoreVertical, Edit, Trash2, Plus, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const StaticCategoryPage = () => {
  return (
    <div className="flex min-h-screen flex-col gap-6 p-8 bg-gray-50">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-black">Developer Platform</h1>
          <p className="text-gray-600">
            Managing Data for Informed Product Decisions
          </p>
        </div>
        {/* <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800">
          <Plus className="h-4 w-4" />
          Add Category
        </button> */}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Total Users</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl text-black font-semibold">0</h3>
              <div className="text-sm text-green-500">0% Active</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Active Users</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl text-black font-semibold">0</h3>
              <div className="text-sm text-blue-500">0 of 0</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Inactive Users</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl text-black font-semibold">0</h3>
              <div className="text-sm text-orange-500">0% Inactive</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Table Actions */}
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-full max-w-sm">
              <div className="relative">
                <Search className="absolute  left-3 top-2.5 h-4 w-4 text-gray-700" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <button className="flex items-center text-black gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              <span>All Status</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="py-3 px-4 text-left font-medium text-gray-600 text-sm">Users Name</th>
                <th className="py-3 px-4 text-left font-medium text-gray-600 text-sm">Slug</th>
                <th className="py-3 px-4 text-left font-medium text-gray-600 text-sm">Status</th>
                <th className="py-3 px-4 text-right font-medium text-gray-600 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-gray-400 mb-2">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 font-medium">No categories found</p>
                    <p className="text-sm text-gray-400">Get started by creating your first category</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing 0 to 0 of 0 categories
          </p>
          <div className="flex items-center gap-2">
            <button className="h-8 w-8 p-0 border text-black border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center disabled:opacity-50" disabled>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="h-8 w-8 p-0 border text-black border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center disabled:opacity-50" disabled>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaticCategoryPage;