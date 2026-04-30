// instrument.ts

import {registerServerPlugins} from "@/server/initialize";

export async function register() {
    await registerServerPlugins();
}