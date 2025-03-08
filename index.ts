import { serve, file } from "bun";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { getCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { decode, sign, verify } from "hono/jwt";
import { cors } from "hono/cors";
import { poweredBy } from "hono/powered-by";

const app = new Hono().basePath("/");

//middleware
app.use(logger());
app.use(poweredBy())
app.use(
  "*",
  cors({
    origin: "*",
    credentials: true,
  })
);
// routing
app.get("/", (c) => {
  return c.text("Hello, World!");
});

app.get("/route", (c) => {
  return c.text("Hello from /route route!");
});

//static file rendering
app.get("/static", serveStatic({ path: "./read.txt" }));

//error page
app.get("/error", (c) => {
  throw new HTTPException(500, {
    message: "Http Exception Error!",
    cause: "Custom Error page!",
  });
});

//cookie handling
app.get("/setCookie", (c) => {
  setCookie(c, "delicious_cookie", "macha");
  return c.text("Cookie set successfully!", 200, {
    "Set-Cookie": "delicious_cookie2=macha2",
  });
});

app.get("/getCookie", (c) => {
  return c.text(`Cookie: ${getCookie(c, "delicious_cookie")}`);
});

//jwt token handling
app.get("/jwt", async (c) => {
  const token = await sign(
    { name: "Kaif Khan", email: "kaif@email.com" },
    "secret"
  );
  return c.text(token);
});

app.get("/decodeJwt/:token", (c) => {
  const token = c.req.param("token");
  const payload = decode(token);
  return c.text(JSON.stringify(payload));
});

app.get("/verifyJwt/:token", async (c) => {
  const token = c.req.param("token");
  const decodedPayload = await verify(token, "secret");

  return c.json(JSON.stringify(decodedPayload));
});

//error handling
app.onError((err, c) => {
  console.error(err.message, err.cause);
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  return c.text("Internal Server Error!", 500);
});

//not found
app.notFound((c) => {
  return c.text("Page not found!", 404);
});

export default {
  port: 3000,
  fetch: app.fetch,
};

// const server = serve({
//   port: 3000,
//   fetch(request) {
//     const { pathname } = new URL(request.url);
//     // console.log(pathname);

//     //routing
//     if (pathname == "/") {
//       return new Response(`Hello from ${pathname} route!`);
//     }

//     if (pathname == "/route") {
//       return new Response(`Hello from ${pathname} route!`);
//     }

//     //error handling
//     if (pathname == "/error") {
//       throw new Error("Error Page");
//     }

//     //static file rendering
//     if (pathname == "/static") {
//       return new Response(file("./read.txt"));
//     }

//     return new Response("Page not found!", {
//       status: 404,
//       headers: {
//         "X-Custom-Error": "Page not found",
//       },
//     });
//   },
//   error(error) {
//     return new Response("Something Went Wrong: " + error.message, {
//       status: 500,
//     });
//   },
// });

// console.log(`Server running on http://localhost:${server.port}`);
