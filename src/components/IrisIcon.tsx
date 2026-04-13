interface IrisIconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  alt?: string;
}

const SIZE_PX: Record<NonNullable<IrisIconProps['size']>, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

export default function IrisIcon({ name, size = 'lg', className, alt }: IrisIconProps) {
  const px = SIZE_PX[size];
  return (
    <img
      src={`/icons/${name}-${size}.svg`}
      width={px}
      height={px}
      alt={alt ?? name}
      className={`iris-icon iris-icon--${size}${className ? ` ${className}` : ''}`}
      data-icon={name}
    />
  );
}
