"use client";
import React, { useRef, useEffect } from "react";

type IconDrawer = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    a: number
) => void;

const icons: IconDrawer[] = [
    function doc(ctx, x, y, r, a) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a);
        ctx.strokeStyle = "#007c8a44";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.rect(-18 * r, -22 * r, 36 * r, 44 * r); // doc outline
        ctx.moveTo(-8 * r, -14 * r); ctx.lineTo(8 * r, -14 * r);
        ctx.moveTo(-8 * r, 0); ctx.lineTo(8 * r, 0);
        ctx.stroke();
        ctx.restore();
    },
    function codeBracket(ctx, x, y, r, a) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a);
        ctx.strokeStyle = "#007c8a44";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-14 * r, -18 * r); ctx.lineTo(-22 * r, 0); ctx.lineTo(-14 * r, 18 * r);
        ctx.moveTo(14 * r, -18 * r); ctx.lineTo(22 * r, 0); ctx.lineTo(14 * r, 18 * r);
        ctx.stroke();
        ctx.restore();
    },
    function pencil(ctx, x, y, r, a) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a);
        ctx.strokeStyle = "#50539944";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-15 * r, 15 * r); ctx.lineTo(15 * r, -15 * r);
        ctx.stroke();
        ctx.restore();
    },
    function bubble(ctx, x, y, r, a) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a);
        ctx.strokeStyle = "#11998e33";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, 20 * r, 13 * r, 0, 0, 2 * Math.PI);
        ctx.moveTo(9 * r, 9 * r); ctx.lineTo(20 * r, 18 * r);
        ctx.stroke();
        ctx.restore();
    },
];

type Shape = {
    icon: IconDrawer;
    x: number;
    y: number;
    r: number;
    v: number;
    a: number;
    spin: number;
};

function createShapes(width: number, height: number): Shape[] {
    const arr: Shape[] = [];
    for (let i = 0; i < 24; ++i) {
        arr.push({
            icon: icons[i % icons.length],
            x: Math.random() * width,
            y: Math.random() * height,
            r: 0.7 + Math.random() * 0.6,
            v: 0.4 + Math.random() * 0.6,
            a: Math.random() * Math.PI * 2,
            spin: Math.random() * 0.005 - 0.0025,
        });
    }
    return arr;
}

const Background: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const shapesRef = useRef<Shape[]>([]);

    useEffect(() => {
        if (!canvasRef.current) return;
        let animationId: number;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        function setCanvasSize() {
            const dpr = window.devicePixelRatio || 1;
            canvasRef.current!.width = window.innerWidth * dpr;
            canvasRef.current!.height = window.innerHeight * dpr;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
        }

        // Initial size & on resize
        setCanvasSize();
        window.addEventListener("resize", setCanvasSize);

        // Initialize shapes
        shapesRef.current = createShapes(window.innerWidth, window.innerHeight);

        function animate() {
            ctx.clearRect(
                0,
                0,
                canvasRef.current!.width,
                canvasRef.current!.height
            );
            for (const sh of shapesRef.current) {
                sh.y -= sh.v;
                sh.a += sh.spin;
                if (sh.y < -40) sh.y = window.innerHeight + 40;
                sh.icon(ctx, sh.x, sh.y, sh.r, sh.a);
            }
            animationId = requestAnimationFrame(animate);
        }
        animate();

        return () => {
            window.removeEventListener("resize", setCanvasSize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                zIndex: 0,
                pointerEvents: "none",
            }}
            aria-hidden
        />
    );
};

export default Background;