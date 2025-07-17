import { Tabs } from "../ui/tabs.jsx";

// Utility to convert camelCase → Title Case
const toTitleCase = (str) =>
  str.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

const categories = [
  "account",
  "privacy",
  "playback",
  "downloads",
  "notification",
  "billing",
  "connectedApps",
  "advancedSettings",
  "placeholder",
];

export function SettingsTabs({ activeTab, onTabChange }) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {categories.map((cat) => (
          <TabsTrigger
            key={cat}
            value={cat}
            className="capitalize"
          >
            {toTitleCase(cat)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
