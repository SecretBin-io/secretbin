import Record from "@nihility-io/record"
import { ComponentChild, JSX } from "preact"
import { BaseProps } from "./base.ts"
import { clsx } from "@nick/clsx"

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
		<th
			scope="row"
			class="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white"
		>
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
		<table
			style={props.style}
			class={clsx("w-full text-left text-gray-500 text-sm rtl:text-right dark:text-gray-400", props.class)}
		>
			<thead class="bg-gray-50 text-gray-700 text-xs uppercase dark:bg-gray-700 dark:text-gray-400">
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
					<tr class="border-b bg-white dark:border-gray-700 dark:bg-gray-800">
						{Record.mapToArray(
							headers,
							(key, _value, i) => <TableCell index={i}>{row[key]}</TableCell>,
						)}
					</tr>
				))}
			</tbody>
		</table>
	)
}
