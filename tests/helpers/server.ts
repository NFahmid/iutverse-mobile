import http from "node:http";
import type { AddressInfo, Socket } from "node:net";

export interface Seen {
  method: string;
  url: string;
  headers: http.IncomingHttpHeaders;
  body: string;
  /** The exact bytes, for binary uploads (body is decoded as UTF-8 text). */
  rawBody: Buffer;
}

export interface TestServer {
  url: string;
  seen: Seen[];
  /** Replace the behaviour for the following requests. */
  respond: (handler: (req: http.IncomingMessage, res: http.ServerResponse, seen: Seen) => void) => void;
  close: () => Promise<void>;
}

export const json = (res: http.ServerResponse, status: number, body: unknown, headers: Record<string, string> = {}) => {
  res.writeHead(status, { "content-type": "application/json", ...headers });
  res.end(JSON.stringify(body));
};

/** A real HTTP server on 127.0.0.1 so timeouts, aborts and connection errors are exercised for real. */
export const startServer = async (): Promise<TestServer> => {
  const seen: Seen[] = [];
  const sockets = new Set<Socket>();
  let handler: Parameters<TestServer["respond"]>[0] = (_req, res) => json(res, 404, { success: false, message: "no handler" });

  const server = http.createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks);
      const entry: Seen = { method: req.method ?? "", url: req.url ?? "", headers: req.headers, body: raw.toString("utf8"), rawBody: raw };
      seen.push(entry);
      handler(req, res, entry);
    });
  });
  server.on("connection", (socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;

  return {
    url: `http://127.0.0.1:${port}`,
    seen,
    respond: (next) => {
      handler = next;
    },
    close: () =>
      new Promise<void>((resolve) => {
        for (const socket of sockets) socket.destroy();
        server.close(() => resolve());
      }),
  };
};

/** An origin nothing listens on: connecting to it fails immediately (ECONNREFUSED). */
export const closedOrigin = async (): Promise<string> => {
  const server = await startServer();
  const { url } = server;
  await server.close();
  return url;
};
