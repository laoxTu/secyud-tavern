import {Registry} from "@/src/model/registerable";
import {Middleware} from "@/src/middleware/index";
import {NextFetchEvent, NextRequest, NextResponse} from "next/server";

class MiddlewareManager extends Registry<Middleware> {
    async handle(
        request: NextRequest,
        event: NextFetchEvent,
        response: NextResponse
    ) {
        let result: NextResponse | undefined = undefined;
        await this.use(async m => {
            result ??= await m.handle(request, event, response);
        }, () => !!result);
        result ??= response;
        return result;
    }
}

const manager = new MiddlewareManager("middleware manager");
export default manager;
