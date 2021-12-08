type ButtonProps = {
  style?: 'solid' | 'ghost';
  children?: any;
};

const styles = {
  solid: 'bg-pink-light text-white hover:bg-pink-dark',
  ghost: 'bg-none text-pink-light'
};

const Button = ({style = 'solid', children}: ButtonProps): JSX.Element => {
  return <button
    className={`py-4 px-8 font-normal rounded-full text-lg gap-2 inline-flex flex-row items-center ${styles[style]}`}>
    {children}
  </button>;
};

export default Button;


