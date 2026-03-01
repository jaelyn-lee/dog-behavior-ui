interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'outline'
}

export const Button = ({
  children,
  className = '',
  variant = 'primary',
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`text-light text-xl ${variant === 'primary' ? 'bg-primary' : 'bg-transparent border-2 border-primary text-primary'} rounded-xl p-2 cursor-pointer w-full mx-auto ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
