// src/components/FarmSimulation.js
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './FarmSimulation.css';

const FarmSimulation = () => {
  const simulationRef = useRef();
  const [markers, setMarkers] = useState([]);
  const [showHighlights, setShowHighlights] = useState(false);
  const cameraRef = useRef();

  useEffect(() => {
    // Set the background image on the body
    document.body.style.backgroundImage = "url('/textures/bg.jpg')";
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center center';
    document.body.style.backgroundRepeat = 'no-repeat';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Sky blue

    // Initial camera (top view)
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 20, 0); // Top view
    camera.lookAt(0, 0, 0); // Looking down at the center
    cameraRef.current = camera; // Save camera reference for later updates

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(800, 600);
    simulationRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.rotateSpeed = 0.5;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 0.5);
    sunLight.position.set(10, 10, 5);
    scene.add(sunLight);

    // Load texture for the ground
    const textureLoader = new THREE.TextureLoader();
    const groundTexture = textureLoader.load('/textures/wheat-field.jpg');
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(10, 10); // Adjust repeat to cover the ground

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ map: groundTexture });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; // Rotate the ground
    scene.add(ground);

    // Add border to the ground
    const borderGeometry = new THREE.EdgesGeometry(groundGeometry);
    const borderMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
    const border = new THREE.LineSegments(borderGeometry, borderMaterial);
    border.rotation.x = -Math.PI / 2; // Align the border with the ground
    scene.add(border);

    // Load wheat model
    const loader = new GLTFLoader();
    const wheatDistance = 3;
    const wheatCountX = 10;
    const wheatCountZ = 10;
    const highlightMarkers = [];

    const loadWheat = () => {
      for (let i = 0; i < wheatCountX; i++) {
        for (let j = 0; j < wheatCountZ; j++) {
          const posX = (i - wheatCountX / 2) * wheatDistance;
          const posZ = (j - wheatCountZ / 2) * wheatDistance;
          loader.load('/models/wheat.glb', (gltf) => {
            const wheat = gltf.scene;
            wheat.position.set(posX, 0, posZ); // Align with the ground
            wheat.scale.set(1, 1, 1); // Scale appropriately

            // Check bounding box
            const box = new THREE.Box3().setFromObject(wheat);
            console.log('Wheat Bounding Box:', box);

            scene.add(wheat);

            // Create half-transparent red dot for highlighting positions
            const markerGeometry = new THREE.CircleGeometry(1, 32);
            const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 });
            const marker = new THREE.Mesh(markerGeometry, markerMaterial);
            marker.rotation.x = -Math.PI / 2; // Align with the ground
            marker.position.set(posX, 0.01, posZ); // Just above the ground
            marker.visible = false;
            scene.add(marker);
            highlightMarkers.push(marker);
          }, undefined, (error) => {
            console.error('Error loading model:', error); // Log any loading errors
          });
        }
      }
      setMarkers(highlightMarkers); // Store markers in state
    };

    loadWheat();

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (simulationRef.current) {
        simulationRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Toggle highlighting function
  const toggleHighlight = () => {
    setShowHighlights(!showHighlights);
    markers.forEach(marker => {
      marker.visible = !marker.visible;
    });
  };

  // Switch to top view
  const setTopView = () => {
    const camera = cameraRef.current;
    camera.position.set(0, 20, 0);
    camera.lookAt(0, 0, 0);
  };

  // Switch to side view
  const setSideView = () => {
    const camera = cameraRef.current;
    camera.position.set(0, 5, 20);
    camera.lookAt(0, 0, 0);
  };

  // Switch to isometric view
  const setIsometricView = () => {
    const camera = cameraRef.current;
    camera.position.set(20, 10, 20); // Isometric (angled) view
    camera.lookAt(0, 0, 0);
  };

  return (
    <div className="simulation-wrapper">
      <div ref={simulationRef} className="simulation-container"></div>
      <div className="buttons-container">
        <button onClick={toggleHighlight}>{showHighlights ? 'Hide Highlights' : 'Show Highlights'}</button>
        <button onClick={setTopView}>Top View</button>
        <button onClick={setSideView}>Side View</button>
        <button onClick={setIsometricView}>Isometric View</button>
      </div>
    </div>
  );
};

export default FarmSimulation;
