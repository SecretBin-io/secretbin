import Record from "@nihility-io/record"
import classNames from "classnames"
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
		<th
			scope="row"
			class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
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
			class={classNames("w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400", props.class)}
		>
			<thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
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
					<tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
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
