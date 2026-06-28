import {ReactNode, useRef, useState} from "react";

export function AccessibleComponent({children, className}
                                    :
                                    {
                                        children: ReactNode,
                                        className?: string
                                    }
) {
    const [focused, setFocused] = useState(false);
    const [hovered, setHovered] = useState(false);

    const isVisible = focused || hovered;

    const elementRef = useRef<HTMLDivElement | null>(null);

    console.log(`Focused ${focused}, hovered: ${hovered}`);

    return (
        <div ref={elementRef} className={`${className || ''}`}>
            <div className={`min-h-28 ${isVisible ? 'hidden' : ''}`}
                 onMouseEnter={() => setHovered(true)}>
            </div>
            <div className={`h-screen ${isVisible ? '' : 'hidden'}`}
                 onClick={() => setHovered(false)}>
            </div>
            <div className={`transition-all duration-75 ${isVisible ? '' : 'hidden'}`}
                 onMouseLeave={() => setHovered(false)}
                 onFocus={() => setFocused(true)}
                 onBlur={() => setFocused(false)}>
                {children}
            </div>
        </div>
    );
}