import { cloneElement, JSX } from "preact"
import * as svgs from "./svg/mod.ts"

export type IconName = keyof typeof svgs

export interface IconProps {
    name: IconName
}

export const Icon = ({ name, ...props }: IconProps & Omit<JSX.IntrinsicElements["svg"], "name">) => {
    const svg = svgs[name] ?? svgs.Close
    return cloneElement(svg, { ...svg.props, ...props })
}