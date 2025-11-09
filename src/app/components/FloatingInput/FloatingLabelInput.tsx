import { useState } from 'react';
import { Input, Select, DatePicker, InputNumber, Form } from 'antd';
import { FormItemProps } from 'antd';
import './FloatingLabelInput.scss';

type ComponentType = 'input' | 'select' | 'date' | 'textarea';

interface FloatingLabelInputProps extends FormItemProps {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  component: ComponentType;
  disabled?: boolean;
  readOnly?: boolean;
  componentProps?: any;
  options?: { label: string; value: any }[];
  onChange?: (value: any) => void;
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  name,
  required,
  type,
  component,
  disabled,
  readOnly,
  componentProps = {},
  options = [],
  onChange,
  ...formItemProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const fieldValue = Form.useWatch(name, Form.useFormInstance());
  const hasValue = fieldValue !== undefined && fieldValue !== null && fieldValue !== '';

  const renderComponent = () => {
    const commonProps = {
      onFocus: () => setIsFocused(true),
      onBlur: () => setIsFocused(false),
      disabled,
      readOnly,
      ...componentProps,
    };

    if (component === 'input') {
      if (type === 'number') {
        const min = componentProps?.min ?? 0;
        return (
          <Form.Item name={name} noStyle>
            <InputNumber
              {...commonProps}
              placeholder=" "
              style={{ width: '100%' }}
              min={min}
              onChange={onChange}
            />
          </Form.Item>
        );
      }

      return (
        <Form.Item name={name} noStyle>
          <Input {...commonProps} placeholder=" " />
        </Form.Item>
      );
    }

    if (component === 'select') {
      return (
        <Form.Item name={name} noStyle>
          <Select
            {...commonProps}
            options={options}
            placeholder=" "
            style={{ width: '100%' }}
            onChange={onChange}
          />
        </Form.Item>
      );
    }

    if (component === 'date') {
      return (
        <Form.Item name={name} noStyle>
          <DatePicker
            showTime
            {...commonProps}
            placeholder=" "
            style={{ width: '100%' }}
            onChange={onChange}
          />
        </Form.Item>
      );
    }

    if (component === 'textarea') {
      return (
        <Form.Item name={name} noStyle>
          <Input.TextArea {...commonProps} placeholder=" " autoSize />
        </Form.Item>
      );
    }

    return null;
  };

  return (
    <div className={`floating-wrapper ${isFocused || hasValue ? 'active' : ''}`}>
      {renderComponent()}
      <label className="floating-label">{label}</label>
    </div>
  );
};

export default FloatingLabelInput;
