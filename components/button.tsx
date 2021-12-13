type ButtonProps = {
  style?: 'solid' | 'ghost';
  size?: 'lg' | 'md';
  children?: any;
};

const styles = {
  solid: 'bg-pink-light text-white hover:bg-pink-dark',
  ghost: 'bg-none text-pink-light'
};

const sizes = {
  lg: 'py-4 px-8 text-lg',
  md: 'py-2 px-4 text-md'
};

const Button = ({style = 'solid', size = 'lg', children}: ButtonProps): JSX.Element => {
  return <button
    className={`${sizes[size]} font-normal rounded-full gap-2 inline-flex flex-row items-center ${styles[style]}`}>
    {children}
  </button>;
};

export default Button;


