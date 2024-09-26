// src/components/Ground.js
import React, { useEffect } from 'react';
import * as THREE from 'three';

const Ground = ({ scene }) => {
  useEffect(() => {
    // Add textured ground
    const loader = new THREE.TextureLoader();
    loader.load('/path-to-your-texture/ground.jpg', (texture) => {
      const groundMaterial = new THREE.MeshBasicMaterial({ map: texture });
      const groundGeometry = new THREE.PlaneGeometry(50, 50);
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2; // Rotate it to be horizontal
      ground.position.y = -0.5; // Lower the ground slightly
      scene.add(ground);
    });
  }, [scene]);

  return null;
};

export default Ground;
