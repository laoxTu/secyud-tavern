import {pluginManager} from "@/shared/plugins";
import {Registerable, Registry} from "@/shared/register";
import {useEffect, useRef, useState} from "react";
import {useErrorHandler} from "@/client/errors";
import {registerBusiness} from "@/client/business";

export class ClientRegistry<T extends Registerable> extends Registry<T> {

}
