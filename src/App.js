import React, {  useRef, useState } from "react";
import './App.css';

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, orderBy, query, limit, serverTimestamp } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

const firebaseApp = initializeApp({
    apiKey: "AIzaSyBpvK387at60swRYUFIbCmMg2io9UxAA9w",
    authDomain: "react-firebase-chat-99528.firebaseapp.com",
    projectId: "react-firebase-chat-99528",
    storageBucket: "react-firebase-chat-99528.appspot.com",
    messagingSenderId: "1043107069340",
    appId: "1:1043107069340:web:5ed8c6e1f01d16d71a1c59"
})

const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

function App() {
    const[user] = useAuthState(auth);
    return (
        <div className="App">
            <header>
                <h1>React and Firebase ChatApp</h1>
                <SignOut />
            </header>
            <section>
                {user ? <ChatRoom /> : <SignIn />}
            </section>
        </div>
    );
}

function SignIn(){
    const signInWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider);
    }

    return(
        <button className="sign-in" onClick={signInWithGoogle}>Sing In with Google</button>
    )
}

function SignOut(){
    return auth.currentUser && (
            <button className="sign-out" onClick={() => signOut(auth)}>Sign Out</button>
        )    
}

function ChatRoom() {
    const dummy = useRef();
    const messagesRef = collection(firestore, "messages");
    const q = query(messagesRef, orderBy("createdAt"), limit(25));
    const [messages] = useCollectionData(q, { idField: "id" });
    const [formValue, setFormValue] = useState("");

    const sendMessage = async (e) => {
        e.preventDefault(); 
        const { uid, photoURL } = auth.currentUser;
        await addDoc(messagesRef, {
            text: formValue,
            createdAt: serverTimestamp(),
            uid,
            photoURL
        });
        setFormValue("");
        dummy.current.scrollIntoView({ behavior: 'smooth' });
    }

    return(
        <>
        <main>
            <div>
                {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
                <span ref={dummy}></span>
            </div>
        </main>

        <form onSubmit={sendMessage}>
            <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Say Hello Chat!" />
            <button type="submit" disabled={!formValue}>
                Send
            </button>
        </form>
        </>
    )
}

function ChatMessage(props){
    const {text, uid, photoURL} = props.message;
    const messageClass = uid === auth.currentUser.uid ? "sent" : "received";
    return (<>
        <div className={`message ${messageClass}`}>
            <img alt="Anoying Terminal" src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
            <p>{text}</p>
        </div>
    </>)
}

export default App;