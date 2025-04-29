import * as Icons from "./Icons.tsx"
import { SVGIconProps } from "./Base.tsx"
export * as Icons from "./Icons.tsx"

export type IconName = keyof typeof Icons

export interface IconProps extends SVGIconProps {
	name: IconName
}

export const Icon = ({ name, ...props }: IconProps) => {
	const NamedIcon = Icons[name] ?? Icons.Close
	return <NamedIcon {...props} />
}
