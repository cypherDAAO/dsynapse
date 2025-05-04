<script>
	import { onMount, onDestroy } from 'svelte';
	import * as THREE from 'three';

	// Referencias equivalentes a los useRef de React
	let containerElement;
	let mousePosition = { x: 0, y: 0 };
	let sphereRef = null;
	let materialRef = null;

	onMount(() => {
		if (!containerElement) return;

		// Configuración básica
		const container = containerElement;
		const width = container.clientWidth;
		const height = container.clientHeight;

		// Crear escena, cámara y renderizador
		const scene = new THREE.Scene();

		const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
		camera.position.z = 7;

		const renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true
		});
		renderer.setSize(width, height);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setClearColor(0x000000, 0); // Fondo transparente
		container.appendChild(renderer.domElement);

		// Grupo principal
		const mainGroup = new THREE.Group();
		scene.add(mainGroup);
		sphereRef = mainGroup;

		// Crear esfera líquida
		const createLiquidSphere = () => {
			const sphereGroup = new THREE.Group();

			// Crear una esfera base con geometría de alta resolución
			const sphereGeometry = new THREE.IcosahedronGeometry(3, 24);

			// Definir los colores de la esfera metálica con degradado de naranja a púrpura
			const color1 = new THREE.Color(0xffaa22); // Dorado-naranja
			const color2 = new THREE.Color(0xff6e9c); // Rosa-naranja
			const color3 = new THREE.Color(0xd76cff); // Púrpura-rosa
			const color4 = new THREE.Color(0x9d9eff); // Azul-púrpura

			// Shader personalizado para el efecto líquido con más detalles
			const fragmentShader = `
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        uniform vec3 color4;
        uniform float time;
        uniform vec3 viewPosition;
        uniform vec3 lightPosition;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        varying vec3 vOriginalPosition;
        
        // Función para simular reflejo metálico
        vec3 metallicReflection(vec3 baseColor, float metalness, float roughness, vec3 normal, vec3 viewDir) {
          // Cálculo de reflejo de tipo Fresnel-Schlick
          float fresnelBase = 1.0 - max(0.0, dot(normal, viewDir));
          float fresnel = pow(fresnelBase, 5.0) * (1.0 - roughness);
          
          // Reflejo metálico basado en el ángulo de visión
          vec3 reflection = mix(vec3(0.04), baseColor, metalness);
          
          // Combinar reflejo con el color base
          return mix(baseColor, reflection, fresnel);
        }
        
        void main() {
          // Coordenadas normalizadas para mezclar colores
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(viewPosition - vWorldPosition);
          
          // Calcular el desplazamiento que simula la tensión superficial de una gota
          float deformation = length(vPosition - vOriginalPosition) * 5.0;
          
          // Simular perturbaciones como ondas en la superficie de una gota
          // que afectan el ángulo de reflejo
          vec3 perturbedNormal = normal;
          
          // Crear ondas concéntricas como si algo hubiera impactado la gota
          float waveCenter = length(vOriginalPosition.xy);
          float wavePhase = waveCenter * 5.0 - time * 2.0;
          float concentricWave = sin(wavePhase) * exp(-waveCenter * 0.5) * 0.2;
          
          // Ondas de turbulencia en la superficie
          float turbulence = 0.0;
          
          // Ondas de turbulencia con diferentes frecuencias
          for (int i = 1; i <= 4; i++) {
            float freq = float(i) * 3.0;
            turbulence += sin(vPosition.x * freq + time * 0.5) * 
                          sin(vPosition.y * freq + time * 0.3) * 
                          sin(vPosition.z * freq + time * 0.7) * 0.02 / float(i);
          }
          
          // Combinar ondas concéntricas y turbulencia
          float totalDisturbance = concentricWave + turbulence + deformation * 0.1;
          
          // Perturbar la normal para simular irregularidades en la superficie
          perturbedNormal.x += totalDisturbance * 2.0;
          perturbedNormal.y += totalDisturbance * 2.0;
          perturbedNormal.z += totalDisturbance * 1.0;
          perturbedNormal = normalize(perturbedNormal);
          
          // Calcular gradiente de color basado en la posición y perturbaciones
          float distFromCenter = length(vPosition) / 3.0;
          distFromCenter = smoothstep(0.0, 1.0, distFromCenter);
          
          // Usar un valor de mezcla afectado por las perturbaciones
          float mixValue = distFromCenter + totalDisturbance * 0.5;
          mixValue = clamp(mixValue, 0.0, 1.0);
          
          // Mezcla de colores metálicos
          vec3 baseColor;
          if (mixValue < 0.33) {
            float localMix = smoothstep(0.0, 0.33, mixValue) * 3.0;
            baseColor = mix(color1, color2, localMix);
          } else if (mixValue < 0.67) {
            float localMix = smoothstep(0.33, 0.67, mixValue) * 3.0 - 1.0;
            baseColor = mix(color2, color3, localMix);
          } else {
            float localMix = smoothstep(0.67, 1.0, mixValue) * 3.0 - 2.0;
            baseColor = mix(color3, color4, localMix);
          }
          
          // Aplicar efecto metálico
          float metalness = 0.9; // Alta metalicidad
          float roughness = 0.2 + totalDisturbance * 0.6; // Rugosidad variable según perturbaciones
          vec3 metallicColor = metallicReflection(baseColor, metalness, roughness, perturbedNormal, viewDir);
          
          // Fresnel para bordes más brillantes
          float fresnelFactor = pow(1.0 - max(0.0, dot(normal, viewDir)), 4.0);
          vec3 color = mix(metallicColor, vec3(1.0), fresnelFactor * 0.5);
          
          // Iluminación para resaltar las perturbaciones
          vec3 lightDir = normalize(lightPosition - vWorldPosition);
          
          // Reflexión de luz con normal perturbada
          vec3 reflectDir = reflect(-lightDir, perturbedNormal);
          float specular = pow(max(dot(reflectDir, viewDir), 0.0), 30.0 * (1.0 - roughness));
          
          // Difuso con contraste aumentado
          float diffuse = max(dot(perturbedNormal, lightDir), 0.0);
          diffuse = pow(diffuse, 2.0); // Exponente para aumentar contraste
          
          // Aplicar iluminación avanzada
          color = color * (0.4 + diffuse * 0.6);
          
          // Resaltar picos de las ondas con brillo adicional
          float waveHighlight = max(0.0, totalDisturbance * 5.0);
          color += vec3(1.0, 0.9, 0.8) * specular * (1.0 + waveHighlight) * 0.5;
          
          // Reflejos de colores como un metal iridiscente
          float iridescence = sin(fresnelFactor * 8.0 + totalDisturbance * 10.0) * 0.5 + 0.5;
          vec3 iridescenceColor = mix(vec3(1.0, 0.4, 0.0), vec3(0.0, 0.4, 1.0), iridescence);
          color += iridescenceColor * specular * 0.3;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `;

			const vertexShader = `
        uniform float time;
        uniform float distortionIntensity;
        uniform vec2 mousePosition;
        uniform float mouseInfluence;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        varying vec3 vOriginalPosition;
        
        // Funciones de ruido simplex
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        
        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          
          // First corner
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          
          // Other corners
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          
          // Permutations
          i = mod289(i);
          vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                  
          // Gradients: 7x7 points over a square, mapped onto an octahedron
          float n_ = 0.142857142857; // 1.0/7.0
          vec3 ns = n_ * D.wyz - D.xzx;
          
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          
          // Normalise gradients
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          
          // Mix final noise value
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }
        
        // Simulación de física de una gota líquida
        vec3 dropletPhysics(vec3 pos, float t) {
          // Guardar posición original normalizada
          vec3 origPos = normalize(pos);
          float len = length(pos);
          
          // Generar fluctuaciones de la tensión superficial
          float surfaceTension = 0.0;
          
          // Ondas de superficie con diferentes frecuencias
          for (int i = 1; i <= 3; i++) {
            float freq = float(i) * 2.0;
            float phase = t * (0.2 + float(i) * 0.1);
            
            // Ondas que se propagan por la superficie
            float wave = snoise(vec3(
              origPos.x * freq + phase,
              origPos.y * freq + phase * 0.7,
              origPos.z * freq + phase * 0.5
            ));
            
            surfaceTension += wave * 0.3 / float(i);
          }
          
          // Simular efecto de impacto en un punto
          vec3 impactPoint = normalize(vec3(sin(t * 0.3), cos(t * 0.2), sin(t * 0.25)));
          float impactDistance = distance(origPos, impactPoint);
          float impactWave = sin(impactDistance * 15.0 - t * 3.0) * exp(-impactDistance * 4.0) * 0.15;
          
          // Combinar todos los efectos
          float totalDisplacement = surfaceTension + impactWave;
          
          // Aplicar el desplazamiento a lo largo de la normal
          return origPos * (len + totalDisplacement);
        }
        
        void main() {
          vUv = uv;
          vOriginalPosition = position; // Guardar posición original
          
          // Utilizar una física de gota para la deformación
          vec3 dropletPos = dropletPhysics(position, time);
          
          // Influencia del mouse con efecto de tensión superficial
          vec3 mouseDirection = vec3(mousePosition.x, mousePosition.y, 0.0);
          float mouseDistance = length(position.xy - mouseDirection.xy);
          float mouseStrength = max(0.0, 1.0 - mouseDistance / 3.0);
          mouseStrength = mouseStrength * mouseStrength; // Efecto no lineal
          
          // Aplicar efecto del mouse como una deformación en la dirección del mouse
          vec3 mouseDeform = normalize(vec3(mousePosition.x, mousePosition.y, 0.5)) * mouseStrength * mouseInfluence;
          
          // Combinar deformación de gotas con interacción del mouse
          vec3 newPosition = mix(dropletPos, dropletPos + mouseDeform, mouseStrength);
          
          // Aplicar factor de distorsión general
          vec3 displacement = newPosition - position;
          newPosition = position + displacement * distortionIntensity;
          
          // Actualizar variables para el fragment shader
          vPosition = newPosition;
          vNormal = normalize(normalMatrix * normal);
          
          // Calcular posición mundial para efectos de iluminación
          vWorldPosition = (modelMatrix * vec4(newPosition, 1.0)).xyz;
          
          // Posición final
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `;

			const liquidMaterial = new THREE.ShaderMaterial({
				uniforms: {
					time: { value: 0 },
					distortionIntensity: { value: 0.8 }, // Distorsión equilibrada para efecto de gota
					mousePosition: { value: new THREE.Vector2(0, 0) },
					mouseInfluence: { value: 1.0 }, // Influencia máxima del mouse
					color1: { value: color1 },
					color2: { value: color2 },
					color3: { value: color3 },
					color4: { value: color4 },
					viewPosition: { value: camera.position },
					lightPosition: { value: new THREE.Vector3(5, 5, 5) }
				},
				vertexShader,
				fragmentShader,
				transparent: true
			});

			materialRef = liquidMaterial;

			// Crear esfera principal
			const sphere = new THREE.Mesh(sphereGeometry, liquidMaterial);
			sphereGroup.add(sphere);

			// Añadir efectos de brillo (bloom) con esferas ligeramente más grandes
			const glowGeometry = new THREE.IcosahedronGeometry(3.05, 4);
			const glowMaterial = new THREE.MeshBasicMaterial({
				color: 0xffffff,
				transparent: true,
				opacity: 0.1,
				blending: THREE.AdditiveBlending
			});

			const glow = new THREE.Mesh(glowGeometry, glowMaterial);
			sphereGroup.add(glow);

			return { sphereGroup, liquidMaterial };
		};

		// Crear y añadir la esfera líquida
		const { sphereGroup, liquidMaterial } = createLiquidSphere();
		mainGroup.add(sphereGroup);

		// Configurar luces para simular un entorno espacial con múltiples fuentes de luz
		const ambientLight = new THREE.AmbientLight(0x222222, 0.3);
		scene.add(ambientLight);

		// Luz principal más intensa para reflejos metálicos
		const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
		mainLight.position.set(5, 8, 5);
		scene.add(mainLight);

		// Luz de borde para acentuar el contorno metálico
		const rimLight = new THREE.DirectionalLight(0x7090ff, 1.0);
		rimLight.position.set(-7, 0, -5);
		scene.add(rimLight);

		// Luz de color para reflejos iridiscentes
		const colorLight = new THREE.PointLight(0xff9040, 1.2, 50);
		colorLight.position.set(3, -6, 10);
		scene.add(colorLight);

		// Rotación inicial
		mainGroup.rotation.x = -0.1;
		mainGroup.rotation.y = 0.1;

		// Configurar interacción con el mouse
		const handleMouseMove = (event) => {
			// Normalizar posición del ratón entre -1 y 1
			const rect = container.getBoundingClientRect();
			mousePosition.x = ((event.clientX - rect.left) / width) * 2 - 1;
			mousePosition.y = -((event.clientY - rect.top) / height) * 2 + 1;

			if (liquidMaterial && liquidMaterial.uniforms) {
				liquidMaterial.uniforms.mousePosition.value.set(mousePosition.x, mousePosition.y);
			}

			// Inclinación suave hacia la posición del ratón con mayor respuesta
			if (sphereRef) {
				const targetRotationX = mousePosition.y * 0.2 - 0.1;
				const targetRotationY = mousePosition.x * 0.2;

				sphereRef.userData = sphereRef.userData || {};
				sphereRef.userData.targetRotationX = targetRotationX;
				sphereRef.userData.targetRotationY = targetRotationY;
			}
		};

		// Añadir interacción
		container.addEventListener('mousemove', handleMouseMove);

		// Animación
		const clock = new THREE.Clock();

		const animate = () => {
			const time = clock.getElapsedTime();

			if (liquidMaterial && liquidMaterial.uniforms) {
				liquidMaterial.uniforms.time.value = time;

				// Actualizar posición de cámara para cálculo de fresnel
				liquidMaterial.uniforms.viewPosition.value.copy(camera.position);

				// Mover luz de color para reflejos dinámicos
				colorLight.position.x = Math.sin(time * 0.3) * 8;
				colorLight.position.z = Math.cos(time * 0.3) * 8;
				liquidMaterial.uniforms.lightPosition.value.copy(colorLight.position);
			}

			// Rotación más lenta para apreciar los detalles metálicos
			mainGroup.rotation.y += 0.001; // Rotación lenta y constante

			// Oscilación suave para simular ingravidez
			mainGroup.position.y = Math.sin(time * 0.5) * 0.3;

			// Animación suave de rotación siguiendo el ratón
			if (sphereRef && sphereRef.userData) {
				const targetX = sphereRef.userData.targetRotationX || -0.1;
				const targetY = sphereRef.userData.targetRotationY || 0;

				// Interpolación suave pero responsiva
				sphereRef.rotation.x += (targetX - sphereRef.rotation.x) * 0.08;
				sphereRef.rotation.y += (targetY - sphereRef.rotation.y) * 0.08;
			}

			renderer.render(scene, camera);
			animationId = requestAnimationFrame(animate);
		};

		let animationId = requestAnimationFrame(animate);

		// Manejar cambios de tamaño
		const handleResize = () => {
			const newWidth = container.clientWidth;
			const newHeight = container.clientHeight;

			camera.aspect = newWidth / newHeight;
			camera.updateProjectionMatrix();

			renderer.setSize(newWidth, newHeight);
		};

		window.addEventListener('resize', handleResize);

		// Proporcionar una función de limpieza para onDestroy
		return () => {
			window.removeEventListener('resize', handleResize);
			container.removeEventListener('mousemove', handleMouseMove);
			
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
			
			if (renderer && container.contains(renderer.domElement)) {
				container.removeChild(renderer.domElement);
			}

			// Liberar memoria
			scene.traverse((object) => {
				if (object instanceof THREE.Mesh) {
					if (object.geometry) {
						object.geometry.dispose();
					}

					if (object.material) {
						if (Array.isArray(object.material)) {
							object.material.forEach((material) => material.dispose());
						} else {
							object.material.dispose();
						}
					}
				}
			});

			if (renderer) {
				renderer.dispose();
			}
		};
	});
</script>

<div
	bind:this={containerElement}
	class="w-full h-full"
	style="height: 500px; overflow: hidden; border-radius: 8px; cursor: pointer; background: transparent;"
/> 