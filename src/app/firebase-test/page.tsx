"use client";

import * as React from "react";
import { firebaseAuth, firestore } from "@/app/lib/firebase/client";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function FirebaseTestPage() {
    const [msg, setMsg] = React.useState("idle");

    async function run() {
        setMsg("running...");
        const email = `test${Date.now()}@example.com`;
        const password = "12345678";

        const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);

        await setDoc(doc(firestore, "users", cred.user.uid), {
            hello: "world",
            createdAt: Date.now(),
        });

        setMsg("ok! user criado e doc salvo no Firestore ✅");
    }

    return (
        <div style={{ padding: 24 }}>
            <button onClick={run}>Testar Firebase</button>
            <p>{msg}</p>
        </div>
    );
}
