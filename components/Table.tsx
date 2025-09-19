import { clsx } from "@nick/clsx"
import Record from "@nihility-io/record"
import { ComponentChild } from "preact"
import { BaseProps } from "./base.ts"


export interface TableProps<T extends string> extends BaseProps {
	/** Header where the keys are used to map rows to the headers and the values are the header display names */
	headers: Record<T, string>

	/** List of table rows */
	rows: Record<T, ComponentChild>[]
}

/**
 * Creates a simple data table
 */
export function Table<T extends string>({ headers, rows, ...props }: TableProps<T>): ComponentChild {
	return (
		<div class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
			<table
				class={clsx("table", props.class)}
			>
				<thead>
					<tr>
						{Record.mapToArray(headers, (_key, value) => (
							<th scope="col" class="px-6 py-3">{value}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr>
							{Record.mapToArray(headers, (key, _value, i) => i > 0
								? <td class="px-6 py-4">{row[key]}</td> : <th scope="row">{row[key]}</th>)}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
