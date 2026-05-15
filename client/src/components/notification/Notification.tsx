import styles from './Notification.module.css';

type Props = {
  message: string;
};

export function Notification({ message }: Props) {
  return (
    <div className={styles.notification} role="alert">
      {message}
    </div>
  );
}
