"use client";

import dynamic from "next/dynamic";
import styles from "./badge-stage.module.css";

const BadgeScene = dynamic(() => import("./BadgeScene"), {
  ssr: false,
  loading: () => (
    <div className={styles.loaderShell} aria-hidden="true">
      <div className={styles.loaderHalo} />
      <div className={styles.loaderBadge} />
    </div>
  ),
});

export function BadgeStage() {
  return (
    <section className={styles.stage}>
      <div className={styles.canvasFrame}>
        <BadgeScene textureUrl="/assets/buri-ufo.png" />
      </div>
      <div className={styles.captionRow}>
        <span className={styles.caption}>Drag / swipe to rotate</span>
        <span className={styles.caption}>Premium enamel-style depth</span>
      </div>
    </section>
  );
}
