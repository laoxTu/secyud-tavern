import {interceptor} from "@/handler/server/interceptor";
import {storyRepository} from "@/modules/stories/server/repository";
import {NextResponse} from "next/server";


export const GET = interceptor.createRoute(
    async (_, records) => {
        const {id, index} = await records.params;
        const entry = await storyRepository.entry.get(id, 'history', index, true);
        return NextResponse.json(entry);
    }
)