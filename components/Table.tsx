import { clsx } from "@nick/clsx"
import Record from "@nihility-io/record"
import { ComponentChild, JSX } from "preact"
import { BaseProps } from "./base.ts"

interface TableCellProps {
	/** Cell index in the row  */
	index: number

	children: ComponentChild
}

/**
 * Creates a new cell for a table
 */
function TableCell({ index, children }: TableCellProps): JSX.Element {
	if (index > 0) {
		return <td class="px-6 py-4">{children}</td>
	}

	return (
		<th scope="row">
			{children}
		</th>
	)
}

export interface TableProps<T extends string> extends BaseProps {
	/** Header where the keys are used to map rows to the headers and the values are the header display names */
	headers: Record<T, string>

	/** List of table rows */
	rows: Record<T, ComponentChild>[]
}

/**
 * Creates a simple data table
 */
export function Table<T extends string>({ headers, rows, ...props }: TableProps<T>): JSX.Element {
	return (
		<div class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
			<table
				class={clsx("table", props.class)}
			>
				<thead>
					<tr>
						{Record.mapToArray(headers, (_key, value) => (
							<th scope="col" class="px-6 py-3">
								{value}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr>
							{Record.mapToArray(headers, (key, _value, i) => <TableCell index={i}>{row[key]}</TableCell>)}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
