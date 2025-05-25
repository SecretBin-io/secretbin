import { JSX } from "preact"
import { SVGIconProps } from "./Base.tsx"
import * as Icons from "./Icons.tsx"
export * as Icons from "./Icons.tsx"

export type IconName = keyof typeof Icons

export interface IconProps extends SVGIconProps {
	name: IconName
}

export function Icon({ name, ...props }: IconProps): JSX.Element {
	const NamedIcon = Icons[name] ?? Icons.Close
	return <NamedIcon {...props} />
}
