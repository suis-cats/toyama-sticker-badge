import Link from "next/link";
import styles from "./badge-page-shell.module.css";
import { BadgeStage } from "./BadgeStage";

type BadgePageShellProps = {
  description: string;
  eyebrow?: string;
  mode?: "drag" | "sensor";
  title?: string;
};

export function BadgePageShell({
  description,
  eyebrow = "Commemorative 3D Badge",
  mode = "drag",
  title = "Toyama UFO Sticker Badge",
}: BadgePageShellProps) {
  return (
    <main className={styles.page}>
      <nav className={styles.nav}>
        <Link
          href="/"
          className={mode === "drag" ? styles.activeTab : styles.tab}
        >
          Drag
        </Link>
        <Link
          href="/sensor"
          className={mode === "sensor" ? styles.activeTab : styles.tab}
        >
          Sensor
        </Link>
      </nav>

      <section className={styles.copy}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
      </section>

      <BadgeStage mode={mode} />
    </main>
  );
}
