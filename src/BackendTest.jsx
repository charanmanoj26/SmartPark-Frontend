import { useEffect, useState } from "react";

function BackendTest() {
    const [message, setMessage] = useState("Connecting to SmartPark backend...");
    useEffect(() => {
    fetch("http://localhost:8080/")
    .then((response) => response.text())
    .then((data) => setMessage(data))
    .catch(() => setMessage("Backend connection failed."));
}, []);
return <p>{message}</p>;
}

export default BackendTest;