import { clsx } from 'clsx';

interface TabGroupProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TabGroup({ tabs, activeTab, onTabChange }: TabGroupProps) {
  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={clsx(
            'px-4 py-1.5 text-sm font-medium rounded-md transition-all',
            tab === activeTab ? 'tab-active' : 'tab-inactive',
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
