type ButtonProps = {
    value: string;
};

const Button = ({ value }: ButtonProps): JSX.Element => {
    return <button className="py-2 px-4 bg-pink-light text-black font-rubik font-light rounded-lg shadow-md hover:bg-pink-dark">
        {value}
    </button>;
};

export default Button;


