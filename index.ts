import { serve } from "bun";

const server = serve({
    port: 3000,
    fetch(request) { 
        return new Response("Hello via Bun!");
    },
}); 

console.log(`Server running on http://localhost:${server.port}`);