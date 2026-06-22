import Cookies from "js-cookie";
import {v4 as uuidv4} from "uuid";


export function getAuthor(t: any) {
    let author = Cookies.get("author") ?? null;
    if (!author) {
        author = window.prompt(t("preset.input_author"), '');
        Cookies.set("author", author ?? uuidv4());
    }

    return author;
}