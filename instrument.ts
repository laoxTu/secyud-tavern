// instrument.ts

import {registerServerPlugins} from "@/server-registerer";

export async function register() {
    await registerServerPlugins();
}