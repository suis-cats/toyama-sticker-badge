import { BadgeStage } from "@/components/badge/BadgeStage";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.copy}>
        <p className={styles.eyebrow}>Commemorative 3D Badge</p>
        <h1 className={styles.title}>Toyama UFO Sticker Badge</h1>
        <p className={styles.description}>
          黒背景の中で静かに浮かぶ、所有感のある立体バッジ。
          ドラッグして角度を変えると、縁の厚みと光沢がやわらかく立ち上がります。
        </p>
      </section>
      <BadgeStage />
    </main>
  );
}
