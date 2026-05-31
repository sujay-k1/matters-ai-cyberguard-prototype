import {
  Header,
  HeaderGlobalAction,
  HeaderGlobalBar,
  HeaderName,
  SkipToContent,
} from '@carbon/react';
import { Switcher, Help, Notification, Search, UserAvatar } from '@carbon/icons-react';
import type { QueueTab } from '../types/queue';

interface AppHeaderProps {
  activeTab: QueueTab;
  onTabChange: (tab: QueueTab) => void;
}

const tabs: QueueTab[] = ['Overview', 'Work Queue', 'Activity Log'];

export function AppHeader({ activeTab, onTabChange }: AppHeaderProps) {
  return (
    <>
      <SkipToContent />
      <Header aria-label="CyberGuard">
        <HeaderGlobalAction aria-label="Open module switcher" tooltipAlignment="end">
          <Switcher size={20} />
        </HeaderGlobalAction>
        <HeaderName href="#" prefix="">
          CyberGuard
        </HeaderName>
        <nav className="cg-top-tabs" aria-label="Primary">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={tab === activeTab ? 'is-active' : ''}
              type="button"
              onClick={() => onTabChange(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>
        <HeaderGlobalBar>
          <HeaderGlobalAction aria-label="Search" tooltipAlignment="end">
            <Search size={20} />
          </HeaderGlobalAction>
          <HeaderGlobalAction aria-label="Notifications" tooltipAlignment="end">
            <Notification size={20} />
          </HeaderGlobalAction>
          <HeaderGlobalAction aria-label="Help" tooltipAlignment="end">
            <Help size={20} />
          </HeaderGlobalAction>
          <HeaderGlobalAction aria-label="User menu" tooltipAlignment="end">
            <UserAvatar size={20} />
          </HeaderGlobalAction>
        </HeaderGlobalBar>
      </Header>
    </>
  );
}
