import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function Map3D({ houses, energyFlows }) {
  const mountRef = useRef(null);
  
  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth * 0.6, window.innerHeight * 0.7);
    mountRef.current.appendChild(renderer.domElement);
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    
    // Create houses
    const houseGeometry = new THREE.BoxGeometry(1, 1, 1);
    
    houses.forEach((house, idx) => {
      const material = new THREE.MeshBasicMaterial({
        color: house.status === 'surplus' ? 0x00ff00 : 
               house.status === 'deficit' ? 0xff0000 : 0xffff00
      });
      
      const cube = new THREE.Mesh(houseGeometry, material);
      cube.position.set(house.x * 3, 0, house.y * 3);
      scene.add(cube);
    });
    
    // Create energy flows
    energyFlows.forEach(flow => {
      const points = [
        new THREE.Vector3(flow.from.x * 3, 0.5, flow.from.y * 3),
        new THREE.Vector3(flow.to.x * 3, 0.5, flow.to.y * 3)
      ];
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0x0088ff });
      const line = new THREE.Line(geometry, material);
      scene.add(line);
    });
    
    camera.position.z = 20;
    camera.position.y = 15;
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    
    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [houses, energyFlows]);
  
  return <div ref={mountRef} className="w-full h-full" />;
}