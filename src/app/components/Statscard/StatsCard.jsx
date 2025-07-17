import React from "react";
import { BarChart2, Users, Video, Eye } from "lucide-react";

const iconMap = {
  red: <Users className="w-6 h-6 text-red-500" />,
  green: <Video className="w-6 h-6 text-green-500" />,
  purple: <Eye className="w-6 h-6 text-purple-500" />,
  blue: <BarChart2 className="w-6 h-6 text-blue-500" />,
};

const StatsCard = ({ label, value, color }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 flex items-center gap-4 hover:scale-105 transition-transform">
      <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700">
        {iconMap[color] || <BarChart2 className="w-6 h-6 text-gray-500" />}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{value}</h3>
      </div>
    </div>
  );
};

export default StatsCard;
