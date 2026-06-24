import {
    getSlotAndHistories,
    invokeCallback,
    registerCallback,
    SlotDataModel,
    useSlotContext
} from "@/slots/client/models";
import {ButtonGroup} from "@/components/ui/button-group";
import {Button} from "@/components/ui/button";
import {ChevronLeftIcon, ChevronRightIcon} from "lucide-react";
import {Input} from "@/components/ui/input";
import {RefObject, useEffect} from "react";
import {handleOutputPageChange} from "@/slots/client/output-pager";
import {PageState} from "@/business/models";
import {useErrorHandler} from "@/handler/client/error";
import {create} from 'zustand';

export interface StoryHistoryPageState {
    page: PageState;
    setPage: (page: PageState) => void;
}

export const useHistoryPageState =
    create<StoryHistoryPageState>((set) => ({
        page: {max: 0, cur: 0},
        setPage: (page) => set({page}),
    }));

export async function handleHistoryPageChange(ctx: RefObject<SlotDataModel>, params: {
    curPage: number,
    curOutputPage?: number
}) {
    await invokeCallback(ctx, "handleHistoryPageChange", params);
}

export function HistoryPagerButtonGroup() {
    const ctx = useSlotContext();
    const {handleError} = useErrorHandler();
    const {page, setPage} = useHistoryPageState();

    const handleHistoryPageChange = async ({curPage, curOutputPage}: {
        curPage: number,
        curOutputPage?: number
    }) => {
        try {
            const {histories} = getSlotAndHistories(ctx);
            const maxPage = histories.length;
            curPage = Math.min(Math.max(0, curPage), maxPage);
            console.debug(`[HistoryPager] set story page: ${curPage}/${maxPage}`);
            setPage({max: maxPage, cur: curPage});

            if (curOutputPage === undefined) {
                curOutputPage = 99999;
                if (curPage > 0) {
                    curOutputPage = histories[curPage - 1].outputId
                }
            }
            // 页面变化时，输出的数量也会变，取最大页
            await handleOutputPageChange(ctx, curOutputPage);
        } catch (err) {
            handleError(err);
        }
    };

    useEffect(() => {
        registerCallback(ctx, "handleHistoryPageChange", handleHistoryPageChange);
    }, []);

    return (<form action={formData => {
        const curPage = Number(formData
            .get('slot-page-index'));
        return handleHistoryPageChange({curPage});
    }}>
        <ButtonGroup className={"bg-white rounded-md"}>
            <Button onClick={() => handleHistoryPageChange({curPage: page.cur - 1})}
                    disabled={page.cur <= 0} variant="outline">
                <ChevronLeftIcon/>
            </Button>
            <Input key={page.cur} defaultValue={page.cur} name='slot-page-index'
                   disabled={page.max === 0} type={'number'} className={"bg-white"}/>
            <Button onClick={() => handleHistoryPageChange({curPage: page.max})}
                    disabled={page.cur === page.max} variant="outline">
                {page.max}
            </Button>
            <Button onClick={() => handleHistoryPageChange({curPage: page.cur + 1})}
                    disabled={page.cur >= page.max} variant="outline">
                <ChevronRightIcon/>
            </Button>
        </ButtonGroup>
    </form>);
}