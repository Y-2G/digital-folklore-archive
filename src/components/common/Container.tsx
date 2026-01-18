import styles from './Container.module.css';

interface ContainerProps {
  children: React.ReactNode;
  as?: 'div' | 'main' | 'section' | 'article';
  className?: string;
}

export function Container({
  children,
  as: Component = 'div',
  className = ''
}: ContainerProps) {
  return (
    <Component className={`${styles.container} ${className}`.trim()}>
      {children}
    </Component>
  );
}
