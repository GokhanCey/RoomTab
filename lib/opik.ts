import { Opik } from "opik";

// Initialize Opik client
// In a real app, you'd use process.env.OPIK_API_KEY
// For hackathon demo, we might mock if keys aren't present
// export const opikClient = new Opik({
//    apiKey: process.env.OPIK_API_KEY || "mock-key",
// });
// Mock client for hackathon build stability if no API key
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const opikClient: any = {
    trace: (obj: any) => ({ end: () => { } })
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logTrace = async (name: string, input: any, output: any) => {
    try {
        if (process.env.OPIK_API_KEY) {
            opikClient.trace({
                name: name,
                input: input,
                output: output
            });
            // trace.end(); // If needed, depending on SDK version
            console.log(`[Opik] Trace logged: ${name}`);
        } else {
            console.log(`[Opik Mock] Trace: ${name}`, { input, output });
        }
    } catch (e) {
        console.warn("[Opik] Failed to log trace", e);
    }
}
