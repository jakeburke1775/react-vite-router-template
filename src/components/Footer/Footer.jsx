import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut aliquam, purus sit amet luctus suscipit, ligula ipsum commodo mauris, at tempor enim magna id dolor. Nulla facilisi. Praesent congue erat at massa.</p>
        <p>&copy; 2025 React Starter Template. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;