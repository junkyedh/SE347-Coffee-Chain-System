import { Button } from '@/components/common/Button/Button';
import './AdminButton.scss';

export interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const AdminButton: React.FC<AdminButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  children,
  onClick,
  disabled = false,
  className,
  type = 'button',
  ...props
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      icon={icon}
      iconPosition={iconPosition}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      className={cn('admin-button', className)}
      type={type}
      {...props}
    >
      {children}
    </Button>
  );
};

export default AdminButton;
