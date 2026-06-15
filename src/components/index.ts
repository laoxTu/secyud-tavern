import {def} from "@/plugins/client/api";

// ---- UI 基元 ----
import * as accordion from "@/components/ui/accordion";
import * as alertDialog from "@/components/ui/alert-dialog";
import * as button from "@/components/ui/button";
import * as buttonGroup from "@/components/ui/button-group";
import * as card from "@/components/ui/card";
import * as checkbox from "@/components/ui/checkbox";
import * as collapsible from "@/components/ui/collapsible";
import * as combobox from "@/components/ui/combobox";
import * as dialog from "@/components/ui/dialog";
import * as empty from "@/components/ui/empty";
import * as field from "@/components/ui/field";
import * as input from "@/components/ui/input";
import * as inputGroup from "@/components/ui/input-group";
import * as item from "@/components/ui/item";
import * as label from "@/components/ui/label";
import * as navigationMenu from "@/components/ui/navigation-menu";
import * as pagination from "@/components/ui/pagination";
import * as resizable from "@/components/ui/resizable";
import * as select from "@/components/ui/select";
import * as separator from "@/components/ui/separator";
import * as skeleton from "@/components/ui/skeleton";
import * as sonner from "@/components/ui/sonner";
import * as switch_ from "@/components/ui/switch";
import * as tabs from "@/components/ui/tabs";
import * as textarea from "@/components/ui/textarea";
import * as tooltip from "@/components/ui/tooltip";
import * as navigationTemplate from "@/components/template/navigation-template";
import * as contentTemplate from "@/components/template/content-template";
import * as editFormTemplate from "@/components/template/edit-form-template";
import * as entryListTemplate from "@/components/template/entry-list-template";

def('@/components/template/navigation-template', navigationTemplate);
def('@/components/template/content-template', contentTemplate);
def('@/components/template/edit-form-template', editFormTemplate);
def('@/components/template/entry-list-template', entryListTemplate);
def('@/components/ui/accordion', accordion);
def('@/components/ui/alert-dialog', alertDialog);
def('@/components/ui/button', button);
def('@/components/ui/button-group', buttonGroup);
def('@/components/ui/card', card);
def('@/components/ui/checkbox', checkbox);
def('@/components/ui/collapsible', collapsible);
def('@/components/ui/combobox', combobox);
def('@/components/ui/dialog', dialog);
def('@/components/ui/empty', empty);
def('@/components/ui/field', field);
def('@/components/ui/input', input);
def('@/components/ui/input-group', inputGroup);
def('@/components/ui/item', item);
def('@/components/ui/label', label);
def('@/components/ui/navigation-menu', navigationMenu);
def('@/components/ui/pagination', pagination);
def('@/components/ui/resizable', resizable);
def('@/components/ui/select', select);
def('@/components/ui/separator', separator);
def('@/components/ui/skeleton', skeleton);
def('@/components/ui/sonner', sonner);
def('@/components/ui/switch', switch_);
def('@/components/ui/tabs', tabs);
def('@/components/ui/textarea', textarea);
def('@/components/ui/tooltip', tooltip);


/** 注册所有 UI 组件到 pluginApi，外部插件可直接 import 引用 */
export function registerComponents() {
    // def() 调用在模块顶层，导入即注册，此函数确保模块被加载
}