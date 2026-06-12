import {useState} from "react";

export function AccessibleComponent({children, className}
                                    :
                                    {
                                        children: React.ReactNode,
                                        className?: string
                                    }
) {
    const [focused, setFocused] = useState(false);
    const [hovered, setHovered] = useState(false);

    const isVisible = focused || hovered;
    return (
        <div
            className={` transition-all duration-100 ${className || ''} ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onTouchStart={() => setFocused(true)}
            aria-expanded={isVisible}>
            {children}
        </div>
    );
}