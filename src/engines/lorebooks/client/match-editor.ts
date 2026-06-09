import {engineName} from "../models";
import {ClientRegistry} from "@/plugins/client";
import {MatchEditor} from "./match-editor-models";

export class MatchEditorRegistry extends ClientRegistry<MatchEditor> {
}


export const lorebookMatchEditorRegistry = new MatchEditorRegistry(engineName);