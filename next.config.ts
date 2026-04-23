import type {NextConfig} from "next";
import {withNextIntlConfig} from "@/src/localization";

const nextConfig: NextConfig = {
    /* config options here */
};

function compose(...plugins: Array<(config: NextConfig) => NextConfig>) {
    return (config: NextConfig) => plugins.reduceRight((acc, plugin) => plugin(acc), config);
}

export default compose(withNextIntlConfig)(nextConfig);
