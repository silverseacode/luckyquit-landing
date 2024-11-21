"use client";
import { useRouter } from "next/navigation";
import styles from "../../app/page.module.css";

const NavBarItems = () => {
  const router = useRouter()

  const scrollToSection = (section: string) => {
    const sectionElement = document.getElementById(section);
    if (sectionElement) {
      const { top } = sectionElement.getBoundingClientRect();
      window.scrollTo({
        top: window.pageYOffset + top,
        behavior: "smooth",
      });
    }
  };
  return (
    <div
      style={{
        flexDirection: "row",
        width: "inherit",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div className={styles.menuItems}>
        <div className={`${styles.menuItem} ${styles.navItem}`}><span>Home</span></div>
        <div className={`${styles.menuItem} ${styles.navItem}`}>
          <span onClick={() => scrollToSection("features-section")}>
            Features
          </span>
        </div>
        <div className={`${styles.menuItem} ${styles.navItem}`}>
          <span onClick={() => scrollToSection("coach-section")}>
            Are you a Coach?
          </span>
        </div>
        <div className={`${styles.menuItem} ${styles.navItem}`}>
          <span onClick={() => scrollToSection("faq-section")}>FAQ</span>
        </div>
      </div>
      {/* <div onClick={() => router.push('/login')} className={styles.signInButton}>Sign In</div> */}
    </div>
  );
};

export default NavBarItems;
