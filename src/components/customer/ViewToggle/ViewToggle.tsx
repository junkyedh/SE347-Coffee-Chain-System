import { Grid, List } from 'lucide-react';
import React from 'react';
import './ViewToggle.scss';

interface ViewToggleProps {
  mode: 'grid' | 'list';
  onChange: (mode: 'grid' | 'list') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ mode, onChange }) => (
  <div className="view-toggle">
    <button className={`btn ${mode === 'grid' ? 'active' : ''}`} onClick={() => onChange('grid')}>
      <Grid />
    </button>
    <button className={`btn ${mode === 'list' ? 'active' : ''}`} onClick={() => onChange('list')}>
      <List />
    </button>
  </div>
);

export default ViewToggle;
