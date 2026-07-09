import {v4 as uuidv4} from "uuid";
import {useDefaultSettingState} from "@/modules/settings/client/models";


export function getAuthor(t: any) {
    let author = useDefaultSettingState.getState().author;
    if (!author) {
        author = window.prompt(t("preset.input_author"), '') ?? uuidv4();
        useDefaultSettingState.setState({author});
    }

    return author;
}