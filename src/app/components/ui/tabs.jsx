// tabs.jsx
import { createContext, useContext, useState, useEffect } from "react";

// Context to share tab state
const TabsContext = createContext();

const toTitleCase = (str) =>
  str.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

const Tabs = ({ categories = [], activeTab, onTabChange, children }) => {
  const [tabValue, setTabValue] = useState(activeTab || categories[0]);

  useEffect(() => {
    if (activeTab && activeTab !== tabValue) {
      setTabValue(activeTab);
    }
  }, [activeTab]);

  const handleTabChange = (newTab) => {
    setTabValue(newTab);
    if (onTabChange) onTabChange(newTab);
  };

  return (
    <TabsContext.Provider value={{ tabValue, setTabValue: handleTabChange }}>
      <div className="w-full">{children}</div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ children }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
    {children}
  </div>
);

const TabsTrigger = ({ value, children }) => {
  const { tabValue, setTabValue } = useContext(TabsContext);
  const isActive = tabValue === value;

  return (
    <button
      onClick={() => setTabValue(value)}
      className={`py-2 px-4 rounded-md text-sm font-medium transition-colors duration-300 focus:outline-none ${
        isActive
          ? "bg-blue-500 text-white"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
    >
      {children || toTitleCase(value)}
    </button>
  );
};

const TabsContent = ({ value, children }) => {
  const { tabValue } = useContext(TabsContext);
  return (
    <div
      className={`transition-opacity duration-300 ease-in-out ${
        tabValue === value ? "opacity-100 block" : "opacity-0 hidden"
      } border-t border-gray-300 pt-4`}
    >
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
