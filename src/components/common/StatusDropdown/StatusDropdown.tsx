import { ArrowDownOutlined } from '@ant-design/icons';
import { Dropdown, Menu } from 'antd';
import React from 'react';
import './StatusDropdown.scss';
import AdminButton from '@/components/admin/AdminButton/AdminButton';

interface StatusDropdownProps {
  value: string;
  onChange: (newStatus: string) => void;
  statusMap: Record<string, { label: string; color: string }>;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({ value, onChange, statusMap }) => {
  const menu = (
    <Menu
      onClick={({ key }) => onChange(key as string)}
      items={Object.entries(statusMap).map(([key, config]) => ({
        key,
        label: <span style={{ color: config.color }}>{config.label}</span>,
      }))}
    />
  );
  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <AdminButton
        className="status-dropdown-trigger"
        variant="secondary"
        size="sm"
        icon={<ArrowDownOutlined />}
      >
        {statusMap[value]?.label || 'Chọn trạng thái'}
      </AdminButton>
    </Dropdown>
  );
};

export default StatusDropdown;
