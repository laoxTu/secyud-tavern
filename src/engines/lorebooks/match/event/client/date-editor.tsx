import {EventDate} from "@/engines/lorebooks/match/event/models";
import {InputGroup, InputGroupInput} from "@/components/ui/input-group";

export function DateEditor({defaultValue, name, id}: { defaultValue: EventDate, name: string, id: string }) {

    return (
        <>
            <InputGroup className="w-full" id={id}>
                <InputGroupInput id={`${id}-year`} type={"number"}
                                 min={0} step={1} name={`${name}-year`}
                                 defaultValue={defaultValue.year}/>
                <InputGroupInput id={`${id}-month`} type={"number"}
                                 min={1} max={12} step={1} name={`${name}-month`}
                                 defaultValue={defaultValue.month}/>
                <InputGroupInput id={`${id}-day`} type={"number"}
                                 min={1} max={31} step={1} name={`${name}-day`}
                                 defaultValue={defaultValue.day}/>
            </InputGroup>
        </>
    );
}


export function getDate(data: FormData, name: string): EventDate {
    return {
        year: parseInt(data.get(`${name}-year`) as string),
        month: parseInt(data.get(`${name}-month`) as string),
        day: parseInt(data.get(`${name}-day`) as string),
    }
}


