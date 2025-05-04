<script lang="ts">
    import { onMount } from 'svelte';
    import * as THREE from 'three';
    
    let container: HTMLElement;
    
    onMount(() => {
      // Configuración básica de Three.js
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);
      
      // Posición de la cámara
      camera.position.z = 5;
      
      // Creación de la geometría para el SuperformulaWireframe (aproximación)
      const geometry = new THREE.IcosahedronGeometry(2, 7);
      const material = new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        wireframe: true,
        transparent: true, 
        opacity: 0.7
      });
      
      const wireframe = new THREE.Mesh(geometry, material);
      scene.add(wireframe);
      
      // Añadir luces
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      
      const pointLight = new THREE.PointLight(0xffffff, 1);
      pointLight.position.set(10, 10, 10);
      scene.add(pointLight);
      
      // Función de animación
      let time = 0;
      const animate = () => {
        requestAnimationFrame(animate);
        
        // Rotación lenta
        wireframe.rotation.x += 0.002;
        wireframe.rotation.y += 0.003;
        
        // Morfología suave a través del tiempo
        time += 0.01;
        const vertices = geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
          const x = vertices[i];
          const y = vertices[i + 1];
          const z = vertices[i + 2];
          
          const distance = Math.sqrt(x * x + y * y + z * z);
          const normalizedX = x / distance;
          const normalizedY = y / distance;
          const normalizedZ = z / distance;
          
          const noiseVal = Math.sin(time + distance * 2) * 0.15;
          vertices[i] = normalizedX * (2 + noiseVal);
          vertices[i + 1] = normalizedY * (2 + noiseVal);
          vertices[i + 2] = normalizedZ * (2 + noiseVal);
        }
        
        geometry.attributes.position.needsUpdate = true;
        
        renderer.render(scene, camera);
      };
      
      animate();
      
      // Manejar el redimensionamiento
      const handleResize = () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        if (container && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        // Liberar recursos
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      };
    });
  </script>
  
  <div bind:this={container} class="w-full h-full"></div>