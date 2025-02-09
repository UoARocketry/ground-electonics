import * as THREE from 'three';

import { useEffect, useRef } from "react";





function MyThree() {
    const refContainer = useRef<HTMLDivElement>(null);
    useEffect(() => {

        const connection = new WebSocket("/ws");

        // === THREE.JS CODE START ===
        var renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);

        // Clear the refContainer before adding a new renderer
        if (refContainer.current) {
            refContainer.current.innerHTML = '';
            refContainer.current.appendChild(renderer.domElement);
        }

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
        camera.position.set(0, 0, 100);
        camera.lookAt(0, 0, 0);

        const scene = new THREE.Scene();

        //create a blue LineBasicMaterial
        const material = new THREE.LineBasicMaterial({ color: 0x0000ff });

        const points: any[] = [];
        var lastId: number | null = null;
        connection.onmessage = (e) => {
            const data = JSON.parse(e.data);

            data.map((point: { id: number, x: number, y: number, z: number }) => {
                // If the id has been seen before (they arrive in order), skip it
                if ((lastId ?? 0) >= point.id) { return; }

                console.log(point);
                points.push(new THREE.Vector3(point.x, point.y, point.z));
            })

            //Create a path from the points and render it
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material);
            scene.add(line);
            renderer.render(scene, camera);
        }
    });

    return (
        <div ref={refContainer}></div>

    );
}


export default MyThree