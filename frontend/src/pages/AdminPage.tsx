import styles from './AdminPage.module.css';

function AdminPage() {
  return (
    <section className={styles.page} aria-labelledby="admin-page-title">
      <h1 id="admin-page-title" className={styles.title}>
        Admin Console
      </h1>
      <p className={styles.message}>
        This page is restricted to administrators.
      </p>
    </section>
  );
}

export default AdminPage;
