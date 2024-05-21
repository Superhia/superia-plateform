'use client';
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, extend, useThree } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

// Extend will make OrbitControls available as a JSX element called orbitControls
extend({ OrbitControls, TextGeometry });

function Text() {
  const ref = useRef();
  const { camera, scene } = useThree();
  useEffect(() => {
    const loader = new FontLoader();
    loader.load('/fonts/helvetiker_regular.typeface.json', (font) => {
      const color = 0x08888;
      const matLite = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
      });
      const message = 'SUPERIA';
      const shapes = font.generateShapes(message, 300);
      const geometry = new THREE.ShapeGeometry(shapes);
      geometry.computeBoundingBox();
      const xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
      geometry.translate(xMid, 0, 0);
      const text = new THREE.Mesh(geometry, matLite);
      text.position.z = -150;
      scene.add(text);

      const matDark = new THREE.LineBasicMaterial({
        color: color,
        side: THREE.DoubleSide,
      });

      const holeShapes = [];
      for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        if (shape.holes && shape.holes.length > 0) {
          for (let j = 0; j < shape.holes.length; j++) {
            const hole = shape.holes[j];
            holeShapes.push(hole);
          }
        }
      }
      shapes.push.apply(shapes, holeShapes);
      const lineText = new THREE.Object3D();
      for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const points = shape.getPoints();
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        geometry.translate(xMid, 0, 0);
        const lineMesh = new THREE.Line(geometry, matDark);
        lineText.add(lineMesh);
      }
      scene.add(lineText);
    });
  }, [scene]);
  return <group ref={ref}></group>;
}

function Controls() {
  const { camera, gl } = useThree();
  return <orbitControls args={[camera, gl.domElement]} />;
}

function ThreeTextBackground() {
  return (
    <Canvas
      camera={{ position: [0, -400, 600], fov: 45 }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}
    >
      <ambientLight intensity={0.5} />
      <Text />
      <Controls />
    </Canvas>
  );
}

export default ThreeTextBackground;
