<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import * as THREE from 'three';
  
    // Propiedades del componente
    export const width = '100%';
    export const height = '100%';
  
    // Referencias
    let container: HTMLElement;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let wireframeMesh: THREE.LineSegments;
    let clock: THREE.Clock;
    let animationFrame: number;
  
    // Controles de ratón
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let targetRotation = { x: 0, y: 0, z: 0 };
    let currentRotation = { x: 0, y: 0, z: 0 };
    let autoRotate = true;
    const rotationSpeed = 2.5;
    const rotationDamping = 0.15;
    const autoRotationSpeed = 0.001;
  
    // Presets basados en las imágenes DSYN proporcionadas
    const state = {
      presets: [
        // Forma floral simétrica (primera imagen DSYN)
        { m1: 6, n11: 3, n12: 2, n13: 5, m2: 6, n21: 3, n22: 2, n23: 5 },
        // Forma con ondulaciones (segunda imagen DSYN)
        { m1: 8, n11: 1, n12: 3, n13: 2, m2: 8, n21: 1, n22: 3, n23: 2 },
        // Forma orgánica abstracta
        { m1: 5, n11: 2, n12: 7, n13: 7, m2: 5, n21: 10, n22: 7, n23: 7 },
        // Forma con vórtice circular
        { m1: 7, n11: 2, n12: 2, n13: 2, m2: 7, n21: 2, n22: 2, n23: 2 }
      ],
      themes: {
        // Paletas de colores basadas en las imágenes DSYN
        NeonPurple: {
          colors: ['#FF9500', '#00FFE5', '#8A2BE2', '#FF00FF'],
          burstColor: '#FFFFFF'
        },
        BlueTeal: {
          colors: ['#00b4db', '#21d4fd', '#4568dc', '#b06ab3'],
          burstColor: '#b5ffff'
        },
        Sunset: {
          colors: ['#FF416C', '#FF4B2B', '#f5af19', '#f12711'],
          burstColor: '#ffffa8'
        },
        Rainbow: {
          colors: ['#39ff14', '#00ffe5', '#ff00ff', '#ff9500'],
          burstColor: '#ffffff'
        }
      },
      themeNames: ['NeonPurple', 'BlueTeal', 'Sunset', 'Rainbow'],
      params: {
        preset: 0,
        morphDuration: 3.0,
        pulseSpeed: 0.8,
        pulseIntensity: 0.2,
        microAnimationIntensity: 0.15,
        colorTheme: 'NeonPurple' as 'NeonPurple' | 'BlueTeal' | 'Sunset' | 'Rainbow',
        burstSpeed: 0.6,
        burstDuration: 8.0,
        multiWave: true
      },
      resolutionTheta: 120,
      resolutionPhi: 120,
      currentPresetParams: null as any,
      targetPresetParams: null as any,
      isMorphing: false,
      morphStartTime: 0,
      burstActive: 0.0,
      burstStartTime: -1.0,
      lastBurstTime: 0,
      prevBurstValue: 0.0
    };
  
    // Función de superfórmula
    function superformula(
      angle: number,
      m: number,
      n1: number,
      n2: number,
      n3: number,
      a = 1,
      b = 1
    ) {
      const term1 = Math.pow(Math.abs(Math.cos((m * angle) / 4) / a), n2);
      const term2 = Math.pow(Math.abs(Math.sin((m * angle) / 4) / b), n3);
      const sum = term1 + term2;
      if (sum === 0) return 0;
      return Math.pow(sum, -1 / n1);
    }
  
    // Función para mapeo lineal
    function mapLinear(x: number, a1: number, a2: number, b1: number, b2: number) {
      return b1 + ((x - a1) * (b2 - b1)) / (a2 - a1);
    }
  
    // Función para suavizar transiciones
    function smoothstep(x: number, min: number, max: number) {
      if (x <= min) return 0;
      if (x >= max) return 1;
      x = (x - min) / (max - min);
      return x * x * (3 - 2 * x);
    }
  
    // Función para suavizar aún más (smootherstep)
    function smootherstep(x: number, min: number, max: number) {
      if (x <= min) return 0;
      if (x >= max) return 1;
      x = (x - min) / (max - min);
      return x * x * x * (x * (x * 6 - 15) + 10);
    }
  
    // Interpolación lineal
    function lerp(x: number, y: number, t: number) {
      return (1 - t) * x + t * y;
    }
  
    // Activar efecto de explosión de energía
    function triggerBurst() {
      if (!clock) return;
  
      const currentTime = clock.getElapsedTime();
  
      if (currentTime - state.lastBurstTime > 0.3) {
        state.burstActive = 1.0;
        state.burstStartTime = currentTime;
        state.lastBurstTime = currentTime;
  
        if (wireframeMesh && wireframeMesh.material instanceof THREE.ShaderMaterial) {
          const theme = state.themes[state.params.colorTheme];
          const burstColor = theme.burstColor || '#ffffff';
  
          wireframeMesh.material.uniforms.burstActive.value = state.burstActive;
          wireframeMesh.material.uniforms.burstStartTime.value = state.burstStartTime;
          wireframeMesh.material.uniforms.burstColor.value.set(burstColor);
        }
      }
    }
  
    // Iniciar la transformación a una nueva forma
    function startMorphing(targetPresetIndex: number) {
      if (!clock) return;
  
      if (
        isNaN(targetPresetIndex) ||
        targetPresetIndex < 0 ||
        targetPresetIndex >= state.presets.length
      ) {
        console.error('Índice de preset inválido:', targetPresetIndex);
        return;
      }
  
      if (!state.isMorphing) {
        state.currentPresetParams = { ...state.presets[state.params.preset] };
      } else {
        state.currentPresetParams = getInterpolatedParams();
      }
  
      state.params.preset = targetPresetIndex;
      state.targetPresetParams = { ...state.presets[targetPresetIndex] };
  
      state.isMorphing = true;
      state.morphStartTime = clock.getElapsedTime();
    }
  
    // Obtener parámetros interpolados durante la transformación
    function getInterpolatedParams() {
      if (!clock) return state.currentPresetParams;
  
      const duration = Math.max(0.001, state.params.morphDuration);
      const elapsedTime = clock.getElapsedTime() - state.morphStartTime;
      const totalProgress = Math.min(1.0, elapsedTime / duration);
  
      if (wireframeMesh && wireframeMesh.material instanceof THREE.ShaderMaterial) {
        const morphEffect = smootherstep(totalProgress, 0, 1) * Math.sin(totalProgress * Math.PI);
        wireframeMesh.material.uniforms.morphProgress.value = morphEffect;
      }
  
      const interpolated: any = {};
      if (state.currentPresetParams && state.targetPresetParams) {
        for (const key in state.currentPresetParams) {
          const factor = smootherstep(totalProgress, 0, 1);
          interpolated[key] = lerp(
            (state.currentPresetParams as any)[key],
            (state.targetPresetParams as any)[key],
            factor
          );
        }
      }
      return interpolated;
    }
  
    // Crear geometría wireframe con mayor detalle para las formas DSYN
    function createWireframe() {
      if (!scene) return;
  
      const geometry = new THREE.BufferGeometry();
      const resTheta = state.resolutionTheta;
      const resPhi = state.resolutionPhi;
      const vertexCount = (resTheta + 1) * (resPhi + 1);
  
      const positions = new Float32Array(vertexCount * 3);
      const colors = new Float32Array(vertexCount * 3);
      const indices: number[] = [];
  
      // Crear una malla de índices más densa para mayor detalle
      for (let i = 0; i < resTheta; i++) {
        for (let j = 0; j < resPhi; j++) {
          const current = i * (resPhi + 1) + j;
          const nextTheta = (i + 1) * (resPhi + 1) + j;
          const nextPhi = current + 1;
          indices.push(current, nextTheta);
          indices.push(current, nextPhi);
        }
        indices.push(i * (resPhi + 1) + resPhi, (i + 1) * (resPhi + 1) + resPhi);
      }
      
      const lastRowStart = resTheta * (resPhi + 1);
      for (let j = 0; j < resPhi; j++) {
        indices.push(lastRowStart + j, lastRowStart + j + 1);
      }
  
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geometry.setIndex(indices);
  
      // Shader material mejorado para efectos visuales similares a DSYN
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0.0 },
          pulseSpeed: { value: state.params.pulseSpeed },
          pulseIntensity: { value: state.params.pulseIntensity },
          microAnimationIntensity: { value: state.params.microAnimationIntensity },
          dashSize: { value: 0.5 },
          dashRatio: { value: 0.3 },
          burstActive: { value: state.burstActive },
          burstStartTime: { value: state.burstStartTime },
          burstSpeed: { value: state.params.burstSpeed },
          burstDuration: { value: state.params.burstDuration },
          burstColor: { value: new THREE.Color(state.themes[state.params.colorTheme].burstColor) },
          multiWave: { value: state.params.multiWave ? 1.0 : 0.0 },
          morphProgress: { value: 0.0 },
          prevBurstValue: { value: 0.0 }
        },
        vertexShader: `
          uniform float time;
          uniform float pulseSpeed;
          uniform float pulseIntensity;
          uniform float microAnimationIntensity;
          uniform float morphProgress;
  
          varying vec3 vColor;
          varying vec3 vPos;
          varying float vLineDistance;
  
          void main() {
              vColor = color;
              vPos = position;
              
              vLineDistance = length(position);
              
              // Efecto de pulso ondulado como en las imágenes DSYN
              float pulse = sin(length(position) * 2.0 - time * pulseSpeed) * pulseIntensity;
              
              // Microanimaciones para dar vida a la forma con suavizado
              float microAnim1 = sin(position.x * 8.0 + time * 3.0) * microAnimationIntensity;
              float microAnim2 = cos(position.y * 9.0 + time * 2.7) * microAnimationIntensity;
              float microAnim3 = sin(position.z * 7.0 + time * 3.3) * microAnimationIntensity;
              
              vec3 microOffset = vec3(microAnim1, microAnim2, microAnim3);
              vec3 pulseOffset = normalize(position) * pulse;
              
              // Intensificar durante la transformación con suavizado
              microOffset *= (1.0 + morphProgress * 2.0);
              
              vec3 animatedPos = position + pulseOffset + microOffset;
              
              // Aumentar escala para hacer la animación más grande
              animatedPos *= 1.5;
              
              gl_Position = projectionMatrix * modelViewMatrix * vec4(animatedPos, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform float dashSize;
          uniform float dashRatio;
          uniform float burstActive;
          uniform float burstStartTime;
          uniform float burstSpeed;
          uniform float burstDuration;
          uniform vec3 burstColor;
          uniform float multiWave;
          uniform float prevBurstValue;
  
          varying vec3 vColor;
          varying vec3 vPos;
          varying float vLineDistance;
  
          // Función de suavizado mejorada
          float smootherstep(float edge0, float edge1, float x) {
              float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
              return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
          }
  
          void main() {
              vec3 finalColor = vColor;
              float finalIntensity = 1.0;
              
              // Efecto de línea discontinua mejorado para evitar parpadeos
              float totalSize = dashSize * (1.0 + dashRatio);
              float patternPos = mod(vLineDistance + time * 0.2, totalSize);
              float dashPart = smoothstep(0.0, 0.1, patternPos) * (1.0 - smoothstep(dashSize - 0.1, dashSize, patternPos));
              
              // En lugar de descartar fragmentos, los hacemos más transparentes
              float opacity = 0.5 + dashPart * 0.5;
              
              finalIntensity *= (1.0 + dashPart * 0.5);
              
              // Efectos de burst para simular las burbujas y esferas en las imágenes DSYN
              if (burstActive > 0.1) {
                  float burstElapsed = max(0.0, time - burstStartTime);
                  if (burstElapsed < burstDuration) {
                      float distOrigin = length(vPos);
                      float progress = smootherstep(0.0, 1.0, burstElapsed / burstDuration);
                      
                      float baseSpeed = burstSpeed;
                      float mainRadius = burstElapsed * baseSpeed;
                      float mainThickness = 0.4 * (1.0 - 0.5 * progress);
                      
                      float mainDist = abs(distOrigin - mainRadius);
                      float mainWave = 1.0 - smootherstep(0.0, mainThickness, mainDist);
                      
                      float trailFactor = smootherstep(0.0, mainRadius, distOrigin) * (1.0 - smootherstep(mainRadius * 0.5, mainRadius, distOrigin));
                      
                      float secondaryWave = 0.0;
                      float tertiaryWave = 0.0;
                      
                      if (multiWave > 0.5) {
                          float secondaryRadius = burstElapsed * (baseSpeed * 1.5);
                          float secondaryThickness = 0.3 * (1.0 - 0.6 * progress);
                          float secondaryDist = abs(distOrigin - secondaryRadius);
                          secondaryWave = 1.0 - smootherstep(0.0, secondaryThickness, secondaryDist);
                          secondaryWave *= 0.7 * (1.0 - progress * 0.7); 
                          
                          float tertiaryRadius = burstElapsed * (baseSpeed * 0.7);
                          float tertiaryThickness = 0.25 * (1.0 - 0.4 * progress);
                          float tertiaryDist = abs(distOrigin - tertiaryRadius);
                          tertiaryWave = 1.0 - smootherstep(0.0, tertiaryThickness, tertiaryDist);
                          tertiaryWave *= 0.5 * (1.0 - progress * 0.5); 
                      }
                      
                      vec3 waveColorShift = burstColor;
                      if (secondaryWave > 0.01) {
                          waveColorShift = mix(burstColor, vec3(0.5, 0.8, 1.0), 0.3);
                      }
                      if (tertiaryWave > 0.01) {
                          waveColorShift = mix(burstColor, vec3(0.8, 0.5, 1.0), 0.3);
                      }
                      
                      float combinedWave = max(max(mainWave, secondaryWave * 0.8), tertiaryWave * 0.6);
                      combinedWave = max(combinedWave, trailFactor * 0.4);
                      
                      // Suavizar la transición del final del burst
                      float timeFade = 1.0 - smootherstep(burstDuration * 0.7, burstDuration, burstElapsed);
                      combinedWave *= timeFade;
                      
                      // Mezcla más suave de colores
                      finalColor = mix(finalColor, waveColorShift, combinedWave * 0.8);
                      finalIntensity += combinedWave * 3.0;
                      
                      float rippleFactor = sin(distOrigin * 10.0 - burstElapsed * 5.0) * 0.5 + 0.5;
                      rippleFactor *= smootherstep(0.0, mainRadius * 0.8, distOrigin) * (1.0 - smootherstep(mainRadius * 0.8, mainRadius, distOrigin));
                      rippleFactor *= 0.15 * timeFade; 
                      
                      finalIntensity += rippleFactor;
                  } else {
                      // Transición suave cuando termina el burst
                      float fadeOutTime = 0.5;
                      float fadeOutProgress = min(1.0, (burstElapsed - burstDuration) / fadeOutTime);
                      opacity *= (1.0 - fadeOutProgress);
                  }
              }
  
              gl_FragColor = vec4(finalColor * finalIntensity, opacity);
          }
        `,
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending
      });
  
      wireframeMesh = new THREE.LineSegments(geometry, material);
      scene.add(wireframeMesh);
  
      // Inicializar parámetros de preset
      state.currentPresetParams = { ...state.presets[state.params.preset] };
      state.targetPresetParams = { ...state.presets[state.params.preset] };
  
      // Actualizar la geometría inicialmente
      updateWireframeGeometry();
    }
  
    // Actualizar geometría wireframe con variaciones para lograr efectos DSYN
    function updateWireframeGeometry() {
      if (!wireframeMesh) return;
  
      const geometry = wireframeMesh.geometry;
      const positions = geometry.attributes.position.array;
      const colors = geometry.attributes.color.array;
  
      const sfParams = state.isMorphing ? getInterpolatedParams() : state.currentPresetParams;
      const resTheta = state.resolutionTheta;
      const resPhi = state.resolutionPhi;
  
      const theme = state.themes[state.params.colorTheme];
      const themeColors = theme.colors.map((color: string) => new THREE.Color(color));
  
      let vertexIndex = 0;
      for (let i = 0; i <= resTheta; i++) {
        const theta = mapLinear(i, 0, resTheta, -Math.PI / 2, Math.PI / 2);
        const r1 = superformula(
          theta,
          (sfParams as any).m1,
          (sfParams as any).n11,
          (sfParams as any).n12,
          (sfParams as any).n13
        );
  
        for (let j = 0; j <= resPhi; j++) {
          const phi = mapLinear(j, 0, resPhi, -Math.PI, Math.PI);
          const r2 = superformula(
            phi,
            (sfParams as any).m2,
            (sfParams as any).n21,
            (sfParams as any).n22,
            (sfParams as any).n23
          );
  
          // Cálculo mejorado para conseguir formas orgánicas como en DSYN
          const x = r1 * Math.cos(theta) * r2 * Math.cos(phi);
          const y = r1 * Math.sin(theta);
          const z = r1 * Math.cos(theta) * r2 * Math.sin(phi);
  
          positions[vertexIndex * 3 + 0] = x;
          positions[vertexIndex * 3 + 1] = y;
          positions[vertexIndex * 3 + 2] = z;
  
          // Mezcla de colores suave para crear el efecto de gradiente más suave
          const colorMix = smootherstep(y, -1.5, 1.5);
          
          const colorPos = colorMix * (themeColors.length - 1);
          const colorIndex1 = Math.floor(colorPos);
          const colorIndex2 = Math.min(colorIndex1 + 1, themeColors.length - 1);
          const colorFraction = colorPos - colorIndex1;
          
          const vertexColor = themeColors[colorIndex1]
            .clone()
            .lerp(themeColors[colorIndex2], smootherstep(colorFraction, 0, 1));
          
          colors[vertexIndex * 3 + 0] = vertexColor.r;
          colors[vertexIndex * 3 + 1] = vertexColor.g;
          colors[vertexIndex * 3 + 2] = vertexColor.b;
          
          vertexIndex++;
        }
      }
  
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
      geometry.computeBoundingSphere();
    }
  
    // Bucle de animación
    function animate() {
      if (!scene || !camera || !renderer || !clock || !wireframeMesh) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }
  
      const elapsedTime = clock.getElapsedTime();
  
      if (state.isMorphing) {
        const morphProgress =
          (elapsedTime - state.morphStartTime) / Math.max(0.001, state.params.morphDuration);
        if (morphProgress >= 1.0) {
          state.isMorphing = false;
          state.currentPresetParams = { ...(state.targetPresetParams as any) };
          updateWireframeGeometry();
        } else {
          updateWireframeGeometry();
        }
      }
  
      if (wireframeMesh.material instanceof THREE.ShaderMaterial) {
        wireframeMesh.material.uniforms.time.value = elapsedTime;
        
        wireframeMesh.material.uniforms.prevBurstValue.value = wireframeMesh.material.uniforms.burstActive.value;
        
        if (state.burstActive > 0.5 && elapsedTime - state.burstStartTime >= state.params.burstDuration) {
          state.burstActive = Math.max(0.0, state.burstActive - 0.01);
          if (state.burstActive <= 0.01) {
            state.burstActive = 0.0;
            state.burstStartTime = -1.0;
          }
        }
        
        wireframeMesh.material.uniforms.burstActive.value = state.burstActive;
        wireframeMesh.material.uniforms.burstStartTime.value = state.burstStartTime;
      }
  
      // Actualizar rotación
      if (wireframeMesh) {
        if (autoRotate) {
          targetRotation.y += autoRotationSpeed;
        }
  
        // Aplicar rotación suave
        currentRotation.x += (targetRotation.x - currentRotation.x) * rotationDamping;
        currentRotation.y += (targetRotation.y - currentRotation.y) * rotationDamping;
        currentRotation.z += (targetRotation.z - currentRotation.z) * rotationDamping;
  
        wireframeMesh.rotation.x = currentRotation.x;
        wireframeMesh.rotation.y = currentRotation.y;
        wireframeMesh.rotation.z = currentRotation.z;
      }
  
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(animate);
    }
  
    // Manejar redimensionamiento de ventana
    function onResize() {
      if (!camera || !renderer || !container) return;
  
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
  
    // Manejadores de eventos de ratón
    function handleMouseDown(event: MouseEvent) {
      isDragging = true;
      previousMousePosition = {
        x: event.clientX,
        y: event.clientY
      };
      autoRotate = false;
      event.preventDefault();
    }
  
    function handleMouseMove(event: MouseEvent) {
      if (!isDragging) return;
  
      const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y
      };
  
      targetRotation.x -= (deltaMove.y / 100) * rotationSpeed;
      targetRotation.y += (deltaMove.x / 100) * rotationSpeed;
  
      // Limitar la rotación vertical
      targetRotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotation.x));
  
      previousMousePosition = {
        x: event.clientX,
        y: event.clientY
      };
    }
  
    function handleMouseUp() {
      isDragging = false;
    }
  
    function handleClick(event: MouseEvent) {
      if (!isDragging) {
        // Alternar rotación automática si es solo un clic
        autoRotate = !autoRotate;
        triggerBurst();
      }
    }
  
    function handleContextMenu(event: MouseEvent) {
      event.preventDefault();
    }
  
    function handleWheel(event: WheelEvent) {
      event.preventDefault();
  
      if (!camera) return;
  
      // Zoom con la rueda del ratón
      const zoomSpeed = 0.5;
      const zoomDirection = event.deltaY > 0 ? 1 : -1;
  
      // Obtener distancia actual al origen
      const distanceVector = new THREE.Vector3(0, 0, 0).sub(camera.position);
      const currentDistance = distanceVector.length();
  
      // Calcular nueva distancia
      const newDistance = Math.max(2, Math.min(10, currentDistance + zoomDirection * zoomSpeed));
  
      // Aplicar nueva distancia manteniendo la dirección
      distanceVector.normalize().multiplyScalar(-newDistance);
      camera.position.copy(distanceVector);
      camera.lookAt(0, 0, 0);
    }
  
    // Configuración y limpieza
    onMount(() => {
      if (!container) return;
  
      // Configurar escena Three.js
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      camera.position.z = 4;
  
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
      container.appendChild(renderer.domElement);
  
      clock = new THREE.Clock();
  
      // Crear wireframe e iniciar animación
      createWireframe();
      animate();
  
      // Configurar event listeners
      container.addEventListener('mousedown', handleMouseDown);
      container.addEventListener('click', handleClick);
      container.addEventListener('contextmenu', handleContextMenu);
      container.addEventListener('wheel', handleWheel);
  
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('resize', onResize);
  
      // Configurar transformación automática a intervalos más largos para reducir parpadeos
      const morphInterval = setInterval(() => {
        const nextPreset = (state.params.preset + 1) % state.presets.length;
        startMorphing(nextPreset);
      }, 8000);
  
      // Configurar explosiones automáticas a intervalos más largos
      const burstInterval = setInterval(() => {
        triggerBurst();
      }, 12000);
  
      // Configurar cambio de tema a intervalos más largos
      const themeInterval = setInterval(() => {
        const currentThemeIndex = state.themeNames.indexOf(state.params.colorTheme);
        const nextThemeIndex = (currentThemeIndex + 1) % state.themeNames.length;
        state.params.colorTheme = state.themeNames[nextThemeIndex] as
          | 'NeonPurple'
          | 'BlueTeal'
          | 'Sunset'
          | 'Rainbow';
  
        updateWireframeGeometry();
  
        if (wireframeMesh && wireframeMesh.material instanceof THREE.ShaderMaterial) {
          const themeColor = state.themes[state.params.colorTheme].burstColor || '#ffffff';
          wireframeMesh.material.uniforms.burstColor.value.set(themeColor);
        }
      }, 10000);
  
      // Función de limpieza
      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
  
        clearInterval(morphInterval);
        clearInterval(burstInterval);
        clearInterval(themeInterval);
  
        window.removeEventListener('resize', onResize);
  
        if (container) {
          container.removeEventListener('mousedown', handleMouseDown);
          container.removeEventListener('click', handleClick);
          container.removeEventListener('contextmenu', handleContextMenu);
          container.removeEventListener('wheel', handleWheel);
        }
  
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
  
        if (container) {
          const canvas = container.querySelector('canvas');
          if (canvas) {
            container.removeChild(canvas);
          }
        }
  
        if (scene && wireframeMesh) {
          scene.remove(wireframeMesh);
        }
  
        if (renderer) {
          renderer.dispose();
        }
      };
    });
  </script>
  
  <div bind:this={container} class="w-full h-full"></div>