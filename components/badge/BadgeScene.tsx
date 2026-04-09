"use client";

import {
  AdaptiveDpr,
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
  PerspectiveCamera,
  Text,
  useTexture,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";

type BadgeSceneProps = {
  textureUrl: string;
};

const BADGE_IMAGE = {
  width: 443,
  height: 765,
};

const BADGE_ASPECT = BADGE_IMAGE.width / BADGE_IMAGE.height;

type BadgeModelProps = {
  textureUrl: string;
};

function createRadialTexture(innerColor: string, outerColor: string) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }

  const gradient = context.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.08,
    size / 2,
    size / 2,
    size * 0.5,
  );

  gradient.addColorStop(0, innerColor);
  gradient.addColorStop(0.42, innerColor);
  gradient.addColorStop(1, outerColor);

  context.clearRect(0, 0, size, size);
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createAlphaTexture(source: CanvasImageSource, width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }

  context.clearRect(0, 0, width, height);
  context.drawImage(source, 0, 0, width, height);

  const imageData = context.getImageData(0, 0, width, height);
  const { data } = imageData;

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3];
    data[index] = alpha;
    data[index + 1] = alpha;
    data[index + 2] = alpha;
    data[index + 3] = 255;
  }

  context.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function BadgeModel({ textureUrl }: BadgeModelProps) {
  const group = useRef<THREE.Group>(null);
  const rimGroup = useRef<THREE.Group>(null);
  const { gl, size } = useThree();
  const texture = useTexture(textureUrl, (loadedTexture) => {
    const anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    loadedTexture.colorSpace = THREE.SRGBColorSpace;
    loadedTexture.anisotropy = anisotropy;
    loadedTexture.minFilter = THREE.LinearMipmapLinearFilter;
    loadedTexture.magFilter = THREE.LinearFilter;
    loadedTexture.generateMipmaps = true;
    loadedTexture.needsUpdate = true;
  });

  const haloTexture = useMemo(
    () => createRadialTexture("rgba(184, 227, 255, 0.92)", "rgba(0, 0, 0, 0)"),
    [],
  );
  const floorGlowTexture = useMemo(
    () => createRadialTexture("rgba(92, 142, 255, 0.55)", "rgba(0, 0, 0, 0)"),
    [],
  );
  const alphaTexture = useMemo(() => {
    const image = texture.image as
      | (CanvasImageSource & { width?: number; height?: number })
      | undefined;

    if (!image || typeof image.width !== "number" || typeof image.height !== "number") {
      return null;
    }

    return createAlphaTexture(image, image.width, image.height);
  }, [texture]);

  useEffect(() => {
    return () => {
      haloTexture?.dispose();
      floorGlowTexture?.dispose();
      alphaTexture?.dispose();
    };
  }, [alphaTexture, floorGlowTexture, haloTexture]);

  const badgeHeight = 2.9;
  const badgeWidth = badgeHeight * BADGE_ASPECT;
  const thickness = 0.18;
  const layerCount = 16;
  const zLayers = useMemo(
    () =>
      Array.from({ length: layerCount }, (_, index) =>
        THREE.MathUtils.lerp(-thickness / 2, thickness / 2, index / (layerCount - 1)),
      ),
    [layerCount],
  );

  const badgeScale =
    size.width < 640
      ? size.width > size.height
        ? 0.78
        : 0.92
      : size.width < 960
        ? 1
        : 1.08;

  useFrame((state, delta) => {
    if (!group.current || !rimGroup.current) {
      return;
    }

    group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.45) * 0.025;
    rimGroup.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.42) * 0.04;
    group.current.position.y = THREE.MathUtils.damp(
      group.current.position.y,
      0.1 + Math.sin(state.clock.elapsedTime * 0.6) * 0.03,
      4,
      delta,
    );
  });

  return (
    <group scale={badgeScale}>
      {haloTexture ? (
        <sprite position={[0, 0.18, -0.72]} scale={[3.5, 3.5, 1]}>
          <spriteMaterial
            map={haloTexture}
            color="#bce4ff"
            opacity={0.18}
            depthWrite={false}
            transparent
          />
        </sprite>
      ) : null}

      {floorGlowTexture ? (
        <sprite position={[0, -1.7, -0.2]} scale={[3.6, 1.35, 1]}>
          <spriteMaterial
            map={floorGlowTexture}
            color="#77a7ff"
            opacity={0.24}
            depthWrite={false}
            transparent
          />
        </sprite>
      ) : null}

      <group ref={rimGroup} position={[0, 0.08, 0]}>
        <mesh
          rotation={[0, 0, Math.PI * 0.015]}
          position={[0, -0.04, -0.01]}
          scale={[0.88, 1.16, 1]}
        >
          <torusGeometry args={[1.26, 0.052, 32, 180]} />
          <meshPhysicalMaterial
            color="#c7dff1"
            emissive="#67a9dc"
            emissiveIntensity={0.12}
            metalness={1}
            roughness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>
      </group>

      <group ref={group} rotation={[0.02, -0.08, 0.01]} position={[0, 0.08, 0]}>
        <mesh position={[0, 0, thickness / 2 - 0.03]}>
          <planeGeometry args={[badgeWidth * 1.01, badgeHeight * 1.01]} />
          <meshPhysicalMaterial
            alphaMap={alphaTexture ?? undefined}
            transparent
            alphaTest={0.5}
            color="#edf5fb"
            emissive="#dceefe"
            emissiveIntensity={0.03}
            metalness={0.42}
            roughness={0.48}
            clearcoat={1}
            clearcoatRoughness={0.22}
            side={THREE.DoubleSide}
          />
        </mesh>

        {zLayers.map((z, index) => (
          <mesh key={z} position={[0, 0, z]} castShadow receiveShadow>
            <planeGeometry args={[badgeWidth, badgeHeight]} />
            <meshPhysicalMaterial
              alphaMap={alphaTexture ?? undefined}
              transparent
              alphaTest={0.5}
              color={index < zLayers.length / 2 ? "#8a98a6" : "#5f6977"}
              emissive={index > zLayers.length * 0.72 ? "#3d4652" : "#0e1318"}
              emissiveIntensity={0.04}
              metalness={0.98}
              roughness={0.38}
              clearcoat={1}
              clearcoatRoughness={0.28}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}

        <mesh position={[0, 0, thickness / 2 + 0.02]} castShadow>
          <planeGeometry args={[badgeWidth, badgeHeight]} />
          <meshBasicMaterial
            map={texture}
            transparent
            alphaTest={0.5}
            side={THREE.FrontSide}
            toneMapped={false}
          />
        </mesh>

        <mesh position={[0, 0, thickness / 2 + 0.03]}>
          <planeGeometry args={[badgeWidth * 0.98, badgeHeight * 0.98]} />
          <meshPhysicalMaterial
            alphaMap={alphaTexture ?? undefined}
            transparent
            alphaTest={0.5}
            opacity={0.08}
            color="#ffffff"
            metalness={0}
            roughness={0.08}
            clearcoat={0.7}
            clearcoatRoughness={0.14}
            depthWrite={false}
            side={THREE.FrontSide}
          />
        </mesh>

        <mesh position={[0, 0, -thickness / 2 - 0.02]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[badgeWidth, badgeHeight]} />
          <meshPhysicalMaterial
            alphaMap={alphaTexture ?? undefined}
            transparent
            alphaTest={0.5}
            color="#a8b8ca"
            emissive="#182536"
            emissiveIntensity={0.06}
            metalness={0.92}
            roughness={0.28}
            clearcoat={1}
            clearcoatRoughness={0.16}
            side={THREE.DoubleSide}
          />
        </mesh>

        <Text
          position={[0, -1.18, -thickness / 2 - 0.035]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.18}
          letterSpacing={0.06}
          color="#eef4fb"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.006}
          outlineColor="#1a2230"
        >
          TSP.Inc
        </Text>
      </group>
    </group>
  );
}

function Scene({ textureUrl }: BadgeSceneProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <>
      <AdaptiveDpr pixelated={false} />
      <color attach="background" args={["#000000"]} />
      <PerspectiveCamera makeDefault position={[0, 0.06, 6.3]} fov={31} />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[2.8, 3.2, 3.4]}
        intensity={1.7}
        color="#ffffff"
      />
      <directionalLight
        position={[-3, -1, 2.8]}
        intensity={0.7}
        color="#7cb4ff"
      />
      <spotLight
        position={[0, 2.8, 4.4]}
        intensity={70}
        angle={0.46}
        penumbra={0.8}
        decay={1.7}
        distance={12}
        color="#d6ecff"
      />

      <Suspense fallback={null}>
        <Environment resolution={128}>
          <group rotation={[0.2, 0.5, 0]}>
            <Lightformer
              form="ring"
              intensity={2.6}
              color="#ffffff"
              scale={4.8}
              position={[0, 1.6, 3.8]}
              target={[0, 0, 0]}
            />
            <Lightformer
              form="rect"
              intensity={2.8}
              color="#8fd6ff"
              scale={[8, 2.4, 1]}
              position={[-3.8, 1.2, 2.2]}
            />
            <Lightformer
              form="rect"
              intensity={2.2}
              color="#ffb8ff"
              scale={[4.4, 3.2, 1]}
              position={[3.4, -0.8, 1.4]}
            />
            <Lightformer
              form="rect"
              intensity={1.4}
              color="#6f89ff"
              scale={[10, 6, 1]}
              position={[0, -4, -2]}
            />
          </group>
        </Environment>

        <BadgeModel textureUrl={textureUrl} />
      </Suspense>

      <ContactShadows
        position={[0, -1.85, 0]}
        opacity={0.62}
        scale={4.8}
        blur={2.8}
        far={5}
        resolution={1024}
        color="#08111e"
      />

      <OrbitControls
        ref={controlsRef}
        enableZoom={false}
        enablePan={false}
        enableDamping
        autoRotate
        autoRotateSpeed={0.8}
        dampingFactor={0.08}
        rotateSpeed={0.85}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI - 0.25}
      />
    </>
  );
}

export default function BadgeScene({ textureUrl }: BadgeSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
    >
      <Scene textureUrl={textureUrl} />
    </Canvas>
  );
}
