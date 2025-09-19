import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline"
import { clsx } from "@nick/clsx"
import { Signal } from "@preact/signals"
import { ComponentChild } from "preact"
import { BaseProps } from "./base.ts"

export interface NumberInputProps extends BaseProps {
	/** Optional minimum value */
	min?: number

	/** Optional maximum value */
	max?: number

	/**
	 * Size of increments and decrements when click the respective button (Default: 1)
	 */
	step?: number

	/** Signal that stores the state. Can be used instead of value and onChange */
	signal?: Signal<number>

	/** Current value */
	value?: number

	/** Function called when the number changed */
	onChange?: (value: number) => void
}

interface NumberButtonProps {
	/** Button mode */
	mode: "+" | "-"

	/** Disables the button */
	disabled?: boolean

	/** Function called when the button is clicked */
	onClick: () => void
}

/** Helper element for incrementing or decrementing the number */
function NumberButton({ mode, disabled, onClick }: NumberButtonProps): ComponentChild {
	return (
		<button
			type="button"
			class="btn btn-primary join-item"
			disabled={disabled}
			onClick={onClick}
		>
			{mode === "+" ? <PlusIcon class="h-4 w-4" /> : <MinusIcon class="h-4 w-4" />}
		</button>
	)
}

/**
 * Creates a number input field with increment and decrement buttons
 */
export function NumberInput({ signal, value, min, max, step = 1, onChange, ...props }: NumberInputProps): ComponentChild {
	const val = signal !== undefined ? signal.value : value!
	const setVal = (v: number) => {
		if (signal !== undefined) {
			signal.value = v
		} else {
			onChange?.(v)
		}
	}

	const setNumber = (n: number) =>
		(min === undefined || n >= min) && (max === undefined || n <= max) && (n % step === 0) ? setVal(n) : setVal(val)

	return (
		<div class={clsx("join", props.class)}>
			<NumberButton
				mode="-"
				disabled={min !== undefined && val <= min}
				onClick={() => setNumber(val - 1)}
			/>
			<label class="input join-item">
				<input
					type="text"
					data-input-counter
					class="w-10 text-center"
					required
					value={"" + val}
					step={step}
					min={min}
					max={max}
					onInput={(e) => setNumber(+e.currentTarget.value)}
				/>
			</label>
			<NumberButton
				mode="+"
				disabled={max !== undefined && val >= max}
				onClick={() => setNumber(val + 1)}
			/>
		</div>
	)
}
