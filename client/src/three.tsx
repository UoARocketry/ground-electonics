import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const RotatingBox = () => {
    const mesh = useRef<THREE.Mesh>(null);
    useFrame(() => {
        if (mesh.current) {
            mesh.current.rotation.x += 0.01;
            mesh.current.rotation.y += 0.01;
        }
    });
    return (
        <mesh ref={mesh} position={[-2, 0, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="orange" />
        </mesh>
    );
};

function Line({ position }: { position: THREE.Vector3[] }) {
    const positions = new Float32Array(position.flatMap(v => [v.x, v.y, v.z]));
    const lineRef = useRef<THREE.Line>(null!)
    useEffect(() => {
        const { current } = lineRef
        current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        current.geometry.attributes.position.needsUpdate = true;
        current.geometry.computeBoundingSphere();
    }, [position])

    return (
        <line ref={lineRef as any}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
            </bufferGeometry>
            <lineBasicMaterial color="black" />
        </line>
    )
}

const RotatingSphere = ({ position }: { position: THREE.Vector3 }) => {
    const mesh = useRef<THREE.Mesh>(null);
    useFrame(() => {
        if (mesh.current) {
            mesh.current.rotation.x += 0.01;
            mesh.current.rotation.y += 0.01;
        }
    });
    return (
        <mesh ref={mesh} position={position}>
            <sphereGeometry args={[0.75, 32, 32]} />
            <meshStandardMaterial color="blue" />
        </mesh>
    );
};

const GroundPlane = () => {

    return (
        <mesh position={[0, 0, 0]}>
            <planeGeometry args={[1000, 1000]} />
            <meshStandardMaterial color="green" opacity={0.5} />
        </mesh>
    );
}
const ThreeScene = ({positions} : {positions: THREE.Vector3[]}) => {

    // useEffect(() => {
    //     const connection = new WebSocket("/ws");
    //     connection.onmessage = (e) => {
    //         const data = JSON.parse(e.data);
    //         const points = data.map((point: { id: number, x: number, y: number, z: number }) => { return new THREE.Vector3(point.x, point.y, point.z) });
    //         console.log(points);
    //         setData(points);
    //     }
    // }, []);


    return (
        <Canvas style={{ height: '100vh' }}
            camera={{ position: [0, 0, 50] }}>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <OrbitControls />
            <RotatingBox />
            {/* <GroundPlane /> */}
            <RotatingSphere position={positions[positions.length - 1]} />
            <Line position={positions} />
        </Canvas>
    );
};
export default ThreeScene;