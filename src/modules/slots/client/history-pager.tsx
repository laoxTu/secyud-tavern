import {slotContext} from "@/modules/slots/client/context";
import {ButtonGroup} from "@/components/ui/button-group";
import {Button} from "@/components/ui/button";
import {ChevronLeftIcon, ChevronRightIcon} from "lucide-react";
import {Input} from "@/components/ui/input";
import {PageState} from "@/business/models";
import {useErrorHandler} from "@/handler/client/error";
import {create} from 'zustand';
import {useOutputPageState} from "@/modules/slots/client/output-pager";

export interface StoryHistoryPageState {
    page: PageState;
    // 默认不更改页面，只重渲染
    setPage: (curPage?: number) => Promise<void>;
}

export const useHistoryPageState =
    create<StoryHistoryPageState>((set, get) => ({
        page: {max: 0, cur: 0},
        setPage: async (curPage) => {
            const {histories} = slotContext.slotData;
            const maxPage = histories.length;
            curPage ??= get().page.cur;
            if (curPage > maxPage)
                curPage = maxPage;
            else if (curPage < 0)
                curPage = 0;

            console.debug(`[slot](page): ${curPage}/${maxPage}`);
            set({page: {max: maxPage, cur: curPage}});

            await useOutputPageState.getState().setPage();
        },
    }));

export function HistoryPagerButtonGroup() {
    const {handleError} = useErrorHandler();
    const {page, setPage} = useHistoryPageState();

    const changePage = async (curPage: number) => {
        try {
            await setPage(curPage);
        } catch (err) {
            handleError(err);
        }
    };

    return (<form action={formData => {
        const curPage = Number(formData
            .get('slot-page-index'));
        return changePage(curPage);
    }}>
        <ButtonGroup className={"bg-white rounded-md"}>
            <Button onClick={() => changePage(page.cur - 1)}
                    disabled={page.cur <= 0} variant="outline">
                <ChevronLeftIcon/>
            </Button>
            <Input key={page.cur}
                   defaultValue={page.cur}
                   name='slot-page-index'
                   disabled={page.max === 0}
                   type={'number'}
                   className={"bg-white"}/>
            <Button onClick={() => changePage(page.max)}
                    disabled={page.cur === page.max} variant="outline">
                {page.max}
            </Button>
            <Button onClick={() => changePage(page.cur + 1)}
                    disabled={page.cur >= page.max} variant="outline">
                <ChevronRightIcon/>
            </Button>
        </ButtonGroup>
    </form>);
}