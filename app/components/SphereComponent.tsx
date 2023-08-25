"use client";
import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei";
import styles from '../../app/page.module.css'
const SphereComponent = () => {
  return (
    <div
    className={styles.containerCanvas}
      style={{ zIndex: 1, position: "absolute", top: "-80px", right: "-67px" }}
    >
      <Canvas style={{ width: "1500px", height: "979px" }}>
        <Suspense fallback={null}>
          <OrbitControls enableZoom={false} />
          <ambientLight intensity={1} />
          <directionalLight position={[3, 2, 1]} />
          <Sphere args={[1, 100, 200]} scale={2.4}>
            <MeshDistortMaterial
              color="#7D5FCE"
              attach="material"
              distort={0.3}
              speed={1}
            />
          </Sphere>
        </Suspense>
      </Canvas>
    </div>
  ); 
};
//width 800 div arriba canvas
export default SphereComponent;
