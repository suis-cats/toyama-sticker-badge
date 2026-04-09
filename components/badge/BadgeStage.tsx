"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
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

type BadgeStageProps = {
  mode?: "drag" | "sensor";
};

export function BadgeStage({ mode = "drag" }: BadgeStageProps) {
  const captions = useMemo(() => {
    if (mode === "sensor") {
      return ["Tilt phone to sway", "Touch enable motion on iPhone"];
    }

    return ["Drag / swipe to rotate", "Premium enamel-style depth"];
  }, [mode]);

  return (
    <section className={styles.stage}>
      <div className={styles.canvasFrame}>
        <BadgeScene textureUrl="/assets/buri-ufo.png" mode={mode} />
      </div>
      <div className={styles.captionRow}>
        {captions.map((caption) => (
          <span key={caption} className={styles.caption}>
            {caption}
          </span>
        ))}
      </div>
    </section>
  );
}
