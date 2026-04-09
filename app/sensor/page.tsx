import { BadgePageShell } from "@/components/badge/BadgePageShell";

export default function SensorPage() {
  return (
    <BadgePageShell
      mode="sensor"
      eyebrow="Sensor Driven Badge"
      description="スマホでは端末の傾きに合わせてバッジがゆっくり揺れます。ドラッグ回転も残しつつ、角度変化が入ったときだけ自然に反応する構成です。"
    />
  );
}
