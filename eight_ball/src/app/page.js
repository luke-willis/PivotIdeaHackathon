"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function Home() {
  const mountRef = useRef(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("Ask a question");
  const [triggerShake, setTriggerShake] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#add8e6"); // Light blue

    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Draw an image
    const textureLoaderImage = new THREE.TextureLoader();
    const imageList = ['dog_1.jpg', 'dog2.png', 'dog3.png', 'dog4.png', 'dog5.png', 'dog6.png', 'charles.jpg'];
    const randomItem = imageList[Math.floor(Math.random() * imageList.length)];
    textureLoaderImage.load(randomItem, (texture) => {
      scene.background = texture;
    });


    // Black sphere (8-ball)
    const ballGeometry = new THREE.SphereGeometry(1, 64, 64);
    const ballMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const eightBall = new THREE.Mesh(ballGeometry, ballMaterial);
    scene.add(eightBall);

    // White circle with "8" on front of ball
    const frontCanvas = document.createElement("canvas");
    frontCanvas.width = frontCanvas.height = 256;
    const frontCtx = frontCanvas.getContext("2d");
    function drawEight() {
      frontCtx.clearRect(0, 0, 256, 256);
      frontCtx.fillStyle = "white";
      frontCtx.beginPath();
      frontCtx.arc(128, 128, 100, 0, Math.PI * 2);
      frontCtx.fill();
      frontCtx.fillStyle = "black";
      frontCtx.font = "bold 120px Arial";
      frontCtx.textAlign = "center";
      frontCtx.textBaseline = "middle";
      frontCtx.fillText("8", 128, 128);
      frontTexture.needsUpdate = true;
    }
    const frontTexture = new THREE.CanvasTexture(frontCanvas);
    const frontMaterial = new THREE.SpriteMaterial({ map: frontTexture });
    const frontSprite = new THREE.Sprite(frontMaterial);
    frontSprite.scale.set(0.7, 0.7, 1);
    frontSprite.position.set(0, 0, 1.01); // Slightly in front of the ball surface
    eightBall.add(frontSprite);
    drawEight();

    // Create answer canvas and texture
    const answerCanvas = document.createElement("canvas");
    answerCanvas.width = answerCanvas.height = 512; // bigger for better resolution
    const answerCtx = answerCanvas.getContext("2d");
    const answerTexture = new THREE.CanvasTexture(answerCanvas);
    answerTexture.minFilter = THREE.LinearFilter;
    const answerMaterial = new THREE.MeshBasicMaterial({
      map: answerTexture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    // Plane geometry smaller for text
    const answerPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 0.6),
      answerMaterial
    );
    answerPlane.visible = false;
    scene.add(answerPlane); // Add directly to scene, NOT as child of ball

    function drawAnswer(text) {
      answerCtx.clearRect(0, 0, 512, 512);
      answerCtx.fillStyle = "rgba(0,0,0,0.8)";
      answerCtx.fillRect(0, 0, 512, 512);
      answerCtx.fillStyle = "white";
      answerCtx.font = "bold 48px Arial";
      answerCtx.textAlign = "center";
      answerCtx.textBaseline = "middle";
      const lines = text.split("\n");
      lines.forEach((line, i) => {
        answerCtx.fillText(line, 256, 220 + i * 60);
      });
      answerTexture.needsUpdate = true;
    }

    let shakeFrame = 0;

    const animate = () => {
      requestAnimationFrame(animate);

      if (triggerShake && shakeFrame < 60) {
        eightBall.rotation.x = Math.sin(shakeFrame * 0.5) * 0.2;
        eightBall.rotation.y = Math.sin(shakeFrame * 0.5) * 0.4;
        shakeFrame++;
        if (shakeFrame === 60) {
          frontSprite.visible = false;
          drawAnswer(answer);
          answerPlane.visible = true;
        }
      }

      // Position answerPlane in front of the ball in world space
      const ballPosition = new THREE.Vector3();
      eightBall.getWorldPosition(ballPosition);

      // Calculate offset vector in front of the ball along camera direction
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);
      cameraDirection.multiplyScalar(-1.1); // distance in front of ball

      answerPlane.position.copy(ballPosition).add(cameraDirection);

      // Make the answer plane face the camera
      answerPlane.lookAt(camera.position);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      mount.removeChild(renderer.domElement);
      window.removeEventListener("resize", handleResize);
    };
  }, [triggerShake, answer]);

  const answers = [
    "That sounds \nlike a pawsome idea!",
    "Uh oh... \nGetting neutered.",
    "Maybe in \n10 dog years",
    "Future's \na bit ruff",
    "*Blank Stare*",
    "I got a bone...",
    "Looks like you will \n be a stray soon.",
    "You're a dog \n chasing a car",
    "If Matthew/Preston \n Luke/Austin \n will win the hackathon"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
    setAnswer(randomAnswer);
    setTriggerShake(false);
    setTimeout(() => {
      setTriggerShake(true);
    }, 50);
  };

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#add8e6" }}>
      <form
        onSubmit={handleSubmit}
        style={{
          padding: 20,
          textAlign: "center",
        }}
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask the Magic 8-Ball a question..."
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            width: "300px",
          }}
        />
      </form>
      <div
        ref={mountRef}
        style={{
          width: "100%",
          height: "calc(100vh - 80px)",
        }}
      />
    </div>
  );
}
