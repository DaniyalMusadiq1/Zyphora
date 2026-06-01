import PropTypes from 'prop-types';
import { Text } from 'react-native';

const variants = {
  h1: 'text-[28px] font-bold text-zy-white',
  h2: 'text-[22px] font-bold text-zy-white',
  h3: 'text-[18px] font-semibold text-zy-white',
  body: 'text-[14px] text-zy-light',
  caption: 'text-[12px] text-zy-grey',
  mono: 'text-[14px] font-mono text-zy-teal',
};

export const ZyText = ({ children, variant = 'body', className = '', ...rest }) => {
  return (
    <Text className={`${variants[variant]} ${className}`} {...rest}>
      {children}
    </Text>
  );
};

ZyText.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['h1', 'h2', 'h3', 'body', 'caption', 'mono']),
  className: PropTypes.string,
};
