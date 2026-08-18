import {v4 as uuidv4} from "uuid";
import {useLocalSettingState} from "@/modules/settings/client/models";


export function getAuthor(t: any) {
    let author = useLocalSettingState.getState().author;
    if (!author) {
        author = window.prompt(t("preset.input_author"), '') ?? uuidv4();
        useLocalSettingState.setState({author});
    }

    return author;
}