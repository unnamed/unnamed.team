type ButtonProps = {
    value: string;
    style?: 'solid' | 'ghost';
};

const Button = ({ value, style = 'solid' }: ButtonProps): JSX.Element => {
    return <button className={`py-2 px-4 font-rubik font-light rounded-lg shadow-md ${style === 'solid' ? 'bg-pink-light text-black hover:bg-pink-dark' : 'bg-night-300 text-white hover:bg-night-200'}`}>
        {value}
    </button>;
};

export default Button;


