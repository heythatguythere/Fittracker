import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, Dumbbell, ShieldCheck, Star, Zap } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import * as THREE from "three";

// --- Reusable Components for the page's scrollable sections ---
const FeatureCard = ({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) => (
    <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
        className="bg-white/30 backdrop-blur-lg p-8 rounded-2xl border border-white/50 shadow-xl text-center flex flex-col items-center"
    >
        <div className="inline-block p-4 bg-white rounded-full mb-5 shadow-md">{icon}</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 flex-grow">{text}</p>
    </motion.div>
);
const TestimonialCard = ({ quote, name, role }: { quote: string, name: string, role: string }) => (
     <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
        className="bg-white/30 backdrop-blur-lg p-6 rounded-2xl border border-white/50 shadow-xl flex flex-col h-full"
    >
        <div className="flex text-yellow-400 mb-4">{[...Array(5)].map((_, i) => <Star key={i} fill="currentColor" />)}</div>
        <p className="text-gray-700 italic flex-grow">"{quote}"</p>
        <div className="mt-4 pt-4 border-t border-gray-200/50 text-right"><p className="font-bold text-gray-900">{name}</p><p className="text-sm text-gray-500">{role}</p></div>
    </motion.div>
);

// --- Main Home Page Component ---
export default function Home() {
    const navigate = useNavigate();
    const mountRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll();
    const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.9]);

    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        currentMount.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(10, 10, 5);
        scene.add(directionalLight);
        const pointLight = new THREE.PointLight(0x00ffff, 100, 100);
        pointLight.position.set(-5, 3, 3);
        scene.add(pointLight);

        const group = new THREE.Group();
        scene.add(group);

        const sphereGeometry = new THREE.IcosahedronGeometry(3, 32);
        const sphereMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x87ceeb, metalness: 0.1, roughness: 0.05,
            transmission: 1.0, thickness: 1.5, ior: 1.4,
        });
        sphereMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uTime = { value: 0 };
            shader.vertexShader = 'uniform float uTime;\n' + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\nfloat time = uTime * 0.4;\nfloat distortion = sin(position.y * 3.5 + time) * sin(position.x * 2.5 + time) * 0.2;\ntransformed += normal * distortion;`);
            sphereMaterial.userData.shader = shader;
        };
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        group.add(sphere);

        const moonMaterial = new THREE.MeshStandardMaterial({ color: 0x99eeff, emissive: 0x00ffff, emissiveIntensity: 2, roughness: 0.1 });
        const moon1 = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 32), moonMaterial);
        const moon2 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), moonMaterial);
        group.add(moon1, moon2);

        const orbitCurve = new THREE.EllipseCurve(0, 0, 4.5, 4.5, 0, 2 * Math.PI, false, 0);
        const orbitPoints = orbitCurve.getPoints(100);
        const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
        const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.4 });
        const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
        orbit.rotation.x = Math.PI / 2.2;
        group.add(orbit);

        camera.position.z = 10;
        
        const clock = new THREE.Clock();
        const animate = () => {
            requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();
            if(sphereMaterial.userData.shader) {
                sphereMaterial.userData.shader.uniforms.uTime.value = elapsedTime;
            }
            group.rotation.y += 0.002;
            
            moon1.position.x = Math.sin(elapsedTime * 0.6) * 4.5;
            moon1.position.z = Math.cos(elapsedTime * 0.6) * 4.5;
            moon1.position.y = Math.cos(elapsedTime * 0.6) * Math.sin(elapsedTime * 0.6);
            moon2.position.x = Math.cos(elapsedTime * 0.4) * 4.5;
            moon2.position.z = Math.sin(elapsedTime * 0.4) * 4.5;

            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (currentMount) {
                camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (currentMount && renderer.domElement) {
                currentMount.removeChild(renderer.domElement);
            }
        };
    }, []);

    const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.15 } } };

    return (
        <div className="w-full bg-[#E8EAEF] text-gray-900">
            {/* --- Layer 1: Fixed Background 3D Object --- */}
            <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="fixed inset-0 h-screen w-full pointer-events-none z-0">
                <div ref={mountRef} className="absolute inset-0" />
            </motion.div>
            
            {/* --- Layer 2: Scrollable UI Content --- */}
            <div className="relative z-20">
                <div className="h-screen flex flex-col">
                    <header className="w-full px-6 md:px-12 py-4 flex justify-between items-center">
                        <span className="text-2xl font-bold text-gray-900">FitTracker</span>
                        <div className="flex items-center space-x-4">
                            <button onClick={() => navigate("/login")} className="font-semibold text-gray-700 hover:text-blue-600 transition-colors">Login</button>
                            <button onClick={() => navigate("/login")} className="bg-gray-900 hover:bg-gray-700 text-white font-semibold px-5 py-2 rounded-full shadow-lg transition-all transform hover:scale-105 flex items-center">Get Started</button>
                        </div>
                    </header>
                    
                    <main className="flex-1 flex flex-col items-center justify-center text-center px-6 -mt-45">
                         <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-6xl md:text-8xl lg:text-9xl font-black text-gray-900 leading-none"
                         >
                            FITTRACKER.
                         </motion.h1>
                    </main> 

                    <footer className="w-full p-6 md:p-12 flex flex-col md:flex-row justify-between items-end">
                         <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }} className="max-w-xs text-left">
                            <h2 className="text-xl font-bold">Intelligent tracking meets personalized AI coaching.</h2>
                            <p className="text-gray-600 mt-2">Go beyond simple logging and truly understand your progress to achieve your goals faster.</p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 1.0, type: 'spring' }} className="mt-8 md:mt-0 flex-shrink-0">
                            <button onClick={() => navigate("/login")} className="w-32 h-32 bg-cyan-400 text-black rounded-full flex items-center justify-center text-center font-bold text-lg hover:scale-110 transition-transform shadow-2xl">
                                Start<br/>Now
                            </button>
                        </motion.div>
                    </footer>
                </div>

                <div className="bg-[#E8EAEF] pt-24">
                    <motion.section variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="container mx-auto px-6 py-16 text-center">
                        <h2 className="text-5xl font-bold text-gray-900">Everything you need to succeed</h2>
                        <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">All your fitness data, beautifully organized and analyzed to provide you with actionable insights.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
                            <FeatureCard icon={<Dumbbell className="h-10 w-10 text-green-500"/>} title="Log Workouts" text="Easily record every set, rep, and cardio session." />
                            <FeatureCard icon={<BarChart3 className="h-10 w-10 text-purple-500"/>} title="Visualize Data" text="See your progress with beautiful, insightful charts." />
                            <FeatureCard icon={<Zap className="h-10 w-10 text-yellow-500"/>} title="AI Suggestions" text="Get smart meal and workout ideas from our AI coach." />
                            <FeatureCard icon={<ShieldCheck className="h-10 w-10 text-blue-500"/>} title="Secure & Private" text="Your data is yours. Safe, secure, and always available." />
                        </div>
                    </motion.section>

                    <motion.section variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="container mx-auto px-6 py-16">
                         <div className="text-center mb-16"><h2 className="text-5xl font-bold text-gray-900">See what others are saying</h2></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <TestimonialCard name="Sarah J." role="Marathon Runner" quote="FitTracker's analytics helped me pinpoint weaknesses in my training and shave minutes off my PR. A total game-changer!" />
                            <TestimonialCard name="Michael B." role="Bodybuilder" quote="The AI meal suggestions are incredible. It takes the guesswork out of my nutrition and keeps my diet exciting and on track." />
                            <TestimonialCard name="Chloe T." role="Yoga Instructor" quote="I love how simple and beautiful the interface is. It makes tracking my daily practice a joy, not a chore." />
                        </div>
                    </motion.section>
                    
                    <footer className="container mx-auto px-6 py-8 text-center text-gray-500"><p>&copy; {new Date().getFullYear()} FitTracker. All rights reserved.</p></footer>
                </div>
            </div>
        </div>
    );
}