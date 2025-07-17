import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { 
  FiUsers, 
  FiVideo, 
  FiMessageSquare, 
  FiAlertTriangle, 
  FiArrowLeft,
  FiArrowRight,
  FiSearch,
  FiEye,
  FiEdit,
  FiTrash2,
  FiLock,
  FiUnlock,
  FiCheck,
  FiX
} from "react-icons/fi";
import API from "../../utils/axiosInstance";
import "react-toastify/dist/ReactToastify.css";


const AdminDashboard = () => {
  const [stats, setStats] = useState({ 
    users: 0, 
    videos: 0, 
    comments: 0, 
    reports: 0 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [content, setContent] = useState(null);
  const [pagination, setPagination] = useState({ 
    page: 1, 
    limit: 10, 
    total: 0 
  });
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal state
  const [modal, setModal] = useState({
    isOpen: false,
    type: null,
    data: null,
    action: null
  });

  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    isAdmin: false,
  });

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (!token) {
      setError("No auth token found. Please login.");
      setLoading(false);
      return;
    }
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        API.get("/admin/stats", { headers: { Authorization: `Bearer ${token}` } }),
        API.get("/admin/users", {
          params: { page: 1, limit: 5 },
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const { users = 0, videos = 0, comments = 0, reports = 0 } = statsRes.data.data || {};
      setStats({ users, videos, comments, reports });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error loading initial data");
    } finally {
      setLoading(false);
    }
  };

  const fetchContent = async (tab, page = 1, query = "") => {
    if (!token) return;

    setLoading(true);
    setActiveTab(tab);
    try {
      let response;
      const params = { page, limit: pagination.limit, ...(query && { search: query }) };
      const headers = { Authorization: `Bearer ${token}` };

      switch (tab) {
        case "users":
          response = await API.get("/admin/users", { params, headers });
          break;
        case "videos":
          response = await API.get("/admin/videos", { params, headers });
          break;
        case "reported-comments":
          response = await API.get("/admin/reported-comments", { params, headers });
          break;
        case "comments":
          response = await API.get("/admin/comments", { params, headers });
          break;  
        case "stats":
          response = await API.get("/admin/stats", { params, headers });
          break;
        default:
          throw new Error("Invalid tab");
      }

      const data = response.data.data || response.data;
      setContent(data);
      setPagination(prev => ({
        ...prev,
        page,
        total: response.data.total || 0,
      }));
    } catch (err) {
      setError(err.response?.data?.message || `Could not load ${tab}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action, data = null) => {
    try {
      let response;
      switch (action) {
        case "view":
          response = await API.get(`/admin/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setModal({
            isOpen: true,
            type: "user",
            data: response.data.data,
            action: "view",
          });
          setUserFormData({
            name: response.data.data.name,
            email: response.data.data.email,
            isAdmin: response.data.data.isAdmin,
          });
          break;
        case "edit":
          response = await API.patch(`/admin/users/${userId}`, data, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toast.success("User updated successfully");
          setModal({ isOpen: false });
          fetchContent(activeTab, pagination.page, searchQuery);
          break;
        case "block":
          response = await API.patch(`/admin/block-user/${userId}/`, {}, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toast.success(response.data.message);
          fetchContent(activeTab, pagination.page, searchQuery);
          break;
        case "delete":
          response = await API.delete(`/admin/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toast.success("User deleted successfully");
          fetchContent(activeTab, pagination.page, searchQuery);
          break;
        default:
          throw new Error("Invalid action");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error performing action");
    }
  };

  const handleVideoAction = async (videoId, action) => {
    try {
      let response;
      switch (action) {
        case "view":
          response = await API.get(`/admin/videos/${videoId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setModal({
            isOpen: true,
            type: "video",
            data: response.data.data,
            action: "view",
          });
          break;
        case "delete":
          response = await API.delete(`/admin/videos/${videoId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toast.success("Video deleted successfully");
          fetchContent(activeTab, pagination.page, searchQuery);
          break;
        default:
          throw new Error("Invalid action");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error performing action");
    }
  };

  const handleCommentAction = async (commentId, action) => {
    try {
      let response;
      switch (action) {
        case "view":
          response = await API.get("/admin/comments", {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log(response.data.data);
          setModal({
            isOpen: true,
            type: "comment",
            data: response.data.data,
            action: "view",
          });
          break;
        case "resolve":
          response = await API.patch(`/admin/resolve-comment/${commentId}`, {}, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toast.success("Comment resolved successfully");
          fetchContent(activeTab, pagination.page, searchQuery);
          break;
        case "delete":
          response = await API.delete(`/admin/comments/${commentId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toast.success("Comment deleted successfully");
          fetchContent(activeTab, pagination.page, searchQuery);
          break;
        default:
          throw new Error("Invalid action");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error performing action");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(pagination.total / pagination.limit)) {
      fetchContent(activeTab, newPage, searchQuery);
    }
  };

  const handleUserFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserFormData({
      ...userFormData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const renderUserModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Manage User</h2>
            <button
              onClick={() => setModal({ isOpen: false })}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            handleUserAction(modal.data._id, "edit", userFormData);
          }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={userFormData.name}
                  onChange={handleUserFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={userFormData.email}
                  onChange={handleUserFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isAdmin"
                  checked={userFormData.isAdmin}
                  onChange={handleUserFormChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Admin Privileges</label>
              </div>
            </div>

            <div className="flex justify-between mt-6 space-x-3">
              <button
                type="button"
                onClick={() => handleUserAction(modal.data._id, "block")}
                className={`flex items-center px-4 py-2 rounded-md text-white ${
                  modal.data.isBlocked ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                } transition-colors`}
              >
                {modal.data.isBlocked ? (
                  <>
                    <FiUnlock className="mr-2" />
                    Unblock
                  </>
                ) : (
                  <>
                    <FiLock className="mr-2" />
                    Block
                  </>
                )}
              </button>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setModal({ isOpen: false })}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderVideoModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Video Details</h2>
            <button 
              onClick={() => setModal({ isOpen: false })} 
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{modal.data.title}</h3>
              <p className="text-gray-600">By {modal.data.author?.name || "Unknown"}</p>
            </div>

            {modal.data.description && (
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-700">{modal.data.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-500">Views</p>
                <p className="text-lg font-semibold">{modal.data.views || 0}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-500">Likes</p>
                <p className="text-lg font-semibold">{modal.data.likes || 0}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-500">Status</p>
                <p className={`text-lg font-semibold ${
                  modal.data.isPublished ? "text-green-600" : "text-yellow-600"
                }`}>
                  {modal.data.isPublished ? "Published" : "Draft"}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-500">Created</p>
                <p className="text-lg font-semibold">
                  {new Date(modal.data.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {modal.data.thumbnail && (
              <div className="mt-4">
                <img
                  src={modal.data.thumbnail}
                  alt="Video thumbnail"
                  className="max-w-full h-auto rounded-md border border-gray-200"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => handleVideoAction(modal.data._id, "delete")}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <FiTrash2 className="mr-2" />
              Delete Video
            </button>
            <button
              onClick={() => setModal({ isOpen: false })}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderStatsCards = () => {
    const cards = [
      { 
        label: "Users", 
        count: stats.users, 
        icon: <FiUsers size={24} />, 
        color: "bg-blue-100 text-blue-600",
        tab: "users"
      },
      { 
        label: "Videos", 
        count: stats.videos, 
        icon: <FiVideo size={24} />, 
        color: "bg-purple-100 text-purple-600",
        tab: "videos"
      },
      { 
        label: "Comments", 
        count: stats.comments, 
        icon: <FiMessageSquare size={24} />, 
        color: "bg-green-100 text-green-600",
        tab: "reported-comments"
      },
      { 
        label: "Reports", 
        count: stats.reports, 
        icon: <FiAlertTriangle size={24} />, 
        color: "bg-red-100 text-red-600",
        tab: "stats"
      },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div
            key={card.label}
            onClick={() => fetchContent(card.tab)}
            className={`p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer ${card.color}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{card.label}</p>
                <p className="text-2xl font-bold mt-1">{card.count}</p>
              </div>
              <div className="p-3 rounded-full bg-white bg-opacity-50">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTable = (data, columns, actions) => {
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={`${item._id}-${column.key}`} className="px-6 py-4 whitespace-nowrap">
                    {column.render ? column.render(item) : item[column.key]}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {actions(item)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      );
    }

    if (!content || (Array.isArray(content) && content.length === 0)) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No data available</p>
        </div>
      );
    }

    switch (activeTab) {
      case "users":
        return renderTable(
          content,
          [
            { key: "name", header: "Name" },
            { key: "email", header: "Email" },
            { 
              key: "status", 
              header: "Status", 
              render: (item) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  item.isBlocked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                }`}>
                  {item.isBlocked ? "Blocked" : "Active"}
                </span>
              )
            },
            { 
              key: "role", 
              header: "Role", 
              render: (item) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  item.isAdmin ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {item.isAdmin ? "Admin" : "User"}
                </span>
              )
            }
          ],
          (user) => (
            <>
              <button
                onClick={() => handleUserAction(user._id, "view")}
                className="text-blue-600 hover:text-blue-900"
                title="View"
              >
                <FiEye />
              </button>
              <button
                onClick={() => handleUserAction(user._id, "block")}
                className={user.isBlocked ? "text-green-600 hover:text-green-900" : "text-red-600 hover:text-red-900"}
                title={user.isBlocked ? "Unblock" : "Block"}
              >
                {user.isBlocked ? <FiUnlock /> : <FiLock />}
              </button>
              <button
                onClick={() => handleUserAction(user._id, "delete")}
                className="text-red-600 hover:text-red-900"
                title="Delete"
              >
                <FiTrash2 />
              </button>
            </>
          )
        );

      case "videos":
        return renderTable(
          content,
          [
            { key: "title", header: "Title" },
            { 
              key: "author", 
              header: "Author", 
              render: (item) => item.author?.name || "Unknown"
            },
            { key: "views", header: "Views" },
            { 
              key: "status", 
              header: "Status", 
              render: (item) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  item.isPublished ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                }`}>
                  {item.isPublished ? "Published" : "Draft"}
                </span>
              )
            }
          ],
          (video) => (
            <>
              <button
                onClick={() => handleVideoAction(video._id, "view")}
                className="text-blue-600 hover:text-blue-900"
                title="View"
              >
                <FiEye />
              </button>
              <button
                onClick={() => handleVideoAction(video._id, "delete")}
                className="text-red-600 hover:text-red-900"
                title="Delete"
              >
                <FiTrash2 />
              </button>
            </>
          )
        );

      case "reported-comments":
        return renderTable(
          content,
          [
            { 
              key: "content", 
              header: "Content", 
              render: (item) => (
                <div className="max-w-xs truncate">{item.content}</div>
              )
            },
            { 
              key: "author", 
              header: "Author", 
              render: (item) => item.author?.name || "Anonymous"
            },
            { key: "reportCount", header: "Reports" },
            { 
              key: "status", 
              header: "Status", 
              render: (item) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  item.isResolved ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {item.isResolved ? "Resolved" : "Reported"}
                </span>
              )
            }
          ],
          (comment) => (
            !comment.isResolved && (
              <>
                <button
                  onClick={() => handleCommentAction(comment._id, "resolve")}
                  className="text-green-600 hover:text-green-900"
                  title="Resolve"
                >
                  <FiCheck />
                </button>
                <button
                  onClick={() => handleCommentAction(comment._id, "delete")}
                  className="text-red-600 hover:text-red-900"
                  title="Delete"
                >
                  <FiTrash2 />
                </button>
              </>
            )
          )
        );

      case "stats":
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <pre className="whitespace-pre-wrap">{JSON.stringify(content, null, 2)}</pre>
          </div>
        );

      default:
        return <div className="text-gray-400 p-4">No content to display.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
            <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">
              <FiUsers size={24} />
            </span>
            Admin Dashboard
          </h1>
        </div>

        {activeTab === "dashboard" ? (
          <>
            {renderStatsCards()}
            <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => fetchContent("users")}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <FiUsers className="text-blue-600" />
                    </div>
                    <span>Manage Users</span>
                  </div>
                </button>
                <button
                  onClick={() => fetchContent("videos")}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-2 rounded-lg mr-3">
                      <FiVideo className="text-purple-600" />
                    </div>
                    <span>Manage Videos</span>
                  </div>
                </button>
                <button
                  onClick={() => fetchContent("reported-comments")}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center">
                    <div className="bg-red-100 p-2 rounded-lg mr-3">
                      <FiAlertTriangle className="text-red-600" />
                    </div>
                    <span>Review Reports</span>
                  </div>
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <button
                onClick={() => setActiveTab("dashboard")}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <FiArrowLeft className="mr-1" />
                Back to Dashboard
              </button>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  fetchContent(activeTab, 1, searchQuery);
                }}
                className="w-full sm:w-auto"
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder={`Search ${activeTab.replace('-', ' ')}...`}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {renderContent()}
            </div>

            {pagination.total > pagination.limit && (
              <div className="flex justify-center mt-6">
                <nav className="inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <FiArrowLeft className="h-5 w-5" />
                  </button>
                  {Array.from(
                    { length: Math.min(5, Math.ceil(pagination.total / pagination.limit)) },
                    (_, i) => {
                      const pageNum = Math.max(
                        1,
                        Math.min(
                          pagination.page - 2,
                          Math.ceil(pagination.total / pagination.limit) - 4
                        )
                      ) + i;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pagination.page === pageNum
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === Math.ceil(pagination.total / pagination.limit)}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <FiArrowRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {modal.isOpen && (
        <>
          {modal.type === "user" && renderUserModal()}
          {modal.type === "video" && renderVideoModal()}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;