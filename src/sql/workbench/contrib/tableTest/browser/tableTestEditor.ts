/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { BaseEditor } from 'vs/workbench/browser/parts/editor/baseEditor';
import { TableView } from 'sql/base/browser/ui/table/highPerf/tableView';
import { ITableRenderer, ITableColumn } from 'sql/base/browser/ui/table/highPerf/table';
import * as DOM from 'vs/base/browser/dom';
import { IStringDictionary } from 'vs/base/common/collections';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { range } from 'vs/base/common/arrays';
import { Table } from 'sql/base/browser/ui/table/table';
import { SlickGridTableTestInput, AsyncTableTestInput } from 'sql/workbench/contrib/tableTest/browser/tabletestinput';
import { AsyncDataProvider, VirtualizedCollection } from 'sql/base/browser/ui/table/asyncDataView';
import { ScrollableSplitView } from 'sql/base/browser/ui/scrollableSplitview/scrollableSplitview';
import { ScrollbarVisibility } from 'vs/base/common/scrollable';
import { Sizing } from 'vs/base/browser/ui/splitview/splitview';
import { Event } from 'vs/base/common/event';

class ColumnRenderer<IDataShape> implements ITableRenderer<IDataShape, { element: HTMLElement }> {

	renderTemplate(container: HTMLElement): { element: HTMLElement; } {
		const element = DOM.append(container, DOM.$('div'));
		return { element };
	}

	renderCell(element: IDataShape, index: number, ccellIndex: number, columnId: string, templateData: { element: HTMLElement; }, width: number): void {
		templateData.element.innerText = element[columnId] as string;
	}

	disposeCell(element: IDataShape, index: number, cellIndex: number, columnId: string, templateData: { element: HTMLElement }, width: number | undefined): void {
		templateData.element.innerText = '';
	}

	disposeTemplate(templateData: { element: HTMLElement; }): void {
	}
}

interface IDataShape extends IStringDictionary<string> {
	columnA: string;
	columnB: string;
	columnC: string;
	columnD: string;
	columnE: string;
	columnF: string;
	columnH: string;
	columnG: string;
	columnI: string;
	columnJ: string;
	columnK: string;
	columnL: string;
}

function generateData(count: number): Array<IDataShape> {
	return range(count).map(r => ({
		columnA: r + 'A',
		columnB: r + 'B',
		columnC: r + 'C',
		columnD: r + 'D',
		columnE: r + 'E',
		columnF: r + 'F',
		columnH: r + 'H',
		columnG: r + 'G',
		columnI: r + 'I',
		columnJ: r + 'J',
		columnK: r + 'K',
		columnL: r + 'L'
	}));
}

const data = generateData(1000000);

export class SlickGridTableTest extends BaseEditor {
	static readonly ID = 'SlickTableTestEditor';
	private dimension = new DOM.Dimension(0, 0);
	private splitview: ScrollableSplitView;

	constructor(
		@ITelemetryService telemetryService: ITelemetryService,
		@IThemeService themeService: IThemeService,
		@IStorageService storageService: IStorageService
	) {
		super(SlickGridTableTest.ID, telemetryService, themeService, storageService);
	}

	protected createEditor(container: HTMLElement): void {
		this.splitview = new ScrollableSplitView(container, { enableResizing: false, verticalScrollbarVisibility: ScrollbarVisibility.Visible, scrollDebounce: 0 });
	}

	async setInput(input: SlickGridTableTestInput): Promise<void> {
		range(input.count).forEach(() => {
			const container = DOM.append(this.getContainer(), DOM.$('div'));
			const columns = [
				{
					name: 'columnA',
					id: 'columnA',
					field: 'columnA'
				},
				{
					name: 'columnB',
					id: 'columnB',
					field: 'columnB'
				},
				{
					name: 'columnC',
					id: 'columnC',
					field: 'columnC'
				},
				{
					name: 'columnD',
					id: 'columnD',
					field: 'columnD'
				},
				{
					name: 'columnE',
					id: 'columnE',
					field: 'columnE'
				},
				{
					name: 'columnF',
					id: 'columnF',
					field: 'columnF'
				},
				{
					name: 'columnH',
					id: 'columnH',
					field: 'columnH'
				},
				{
					name: 'columnG',
					id: 'columnG',
					field: 'columnG'
				},
				{
					name: 'columnI',
					id: 'columnI',
					field: 'columnI'
				},
				{
					name: 'columnJ',
					id: 'columnJ',
					field: 'columnJ'
				},
				{
					name: 'columnK',
					id: 'columnK',
					field: 'columnK'
				},
				{
					name: 'columnL',
					id: 'columnL',
					field: 'columnL'
				},
			];
			const collection = new VirtualizedCollection<IDataShape>(50, () => ({} as IDataShape), data.length, (offset, count) => Promise.resolve(data.slice(offset, offset + count)));
			collection.setCollectionChangedCallback((startindex, count) => {
				table.invalidateRows(range(startindex, startindex + count), true);
			});
			const table = new Table<IDataShape>(container,
				{
					columns,
					dataProvider: new AsyncDataProvider<IDataShape>(collection)
				},
				{
					syncColumnCellResize: true
				}
			);
			this.splitview.addView({
				element: container,
				layout: size => {
					container.style.width = this.dimension.width - 10 + 'px';
					container.style.height = size + 'px';
					table.layout(new DOM.Dimension(this.dimension.width - 10, size));
				},
				maximumSize: Number.POSITIVE_INFINITY,
				minimumSize: 176,
				onDidChange: Event.None
			}, Sizing.Distribute);
		});

		this.layout(this.dimension);
	}

	layout(size: DOM.Dimension) {
		this.dimension = size;
		this.splitview.layout(size.height);
	}
}

export class AsyncTableTestEditor extends BaseEditor {
	private dimension = new DOM.Dimension(0, 0);
	private splitview: ScrollableSplitView;

	static readonly ID = 'AsyncTableTestEditor';

	constructor(
		@ITelemetryService telemetryService: ITelemetryService,
		@IThemeService themeService: IThemeService,
		@IStorageService storageService: IStorageService
	) {
		super(AsyncTableTestEditor.ID, telemetryService, themeService, storageService);
	}

	protected createEditor(parent: HTMLElement): void {
		this.splitview = new ScrollableSplitView(parent, { enableResizing: false, verticalScrollbarVisibility: ScrollbarVisibility.Visible, scrollDebounce: 0 });
	}

	async setInput(input: AsyncTableTestInput): Promise<void> {
		range(input.count).forEach(() => {
			const container = DOM.append(this.getContainer(), DOM.$('div'));
			const renderer = new ColumnRenderer<IDataShape>();
			const columns: Array<ITableColumn<IDataShape, { element: HTMLElement }>> = [
				{
					renderer,
					id: 'columnA',
					name: 'columnA'
				},
				{
					renderer,
					id: 'columnB',
					name: 'columnB'
				},
				{
					renderer,
					id: 'columnC',
					name: 'columnC'
				},
				{
					renderer,
					id: 'columnD',
					name: 'columnD'
				},
				{
					renderer,
					id: 'columnE',
					name: 'columnE'
				},
				{
					renderer,
					id: 'columnF',
					name: 'columnF'
				},
				{
					renderer,
					id: 'columnH',
					name: 'columnH'
				},
				{
					renderer,
					id: 'columnG',
					name: 'columnG'
				},
				{
					renderer,
					id: 'columnI',
					name: 'columnI'
				},
				{
					renderer,
					id: 'columnJ',
					name: 'columnJ'
				},
				{
					renderer,
					id: 'columnK',
					name: 'columnK'
				},
				{
					renderer,
					id: 'columnL',
					name: 'columnL'
				}
			];
			const table = new TableView(container, columns, { getRow: (index) => Promise.resolve(data[index]) });
			table.length = data.length;
			this.splitview.addView({
				element: container,
				layout: size => {
					container.style.width = this.dimension.width - 10 + 'px';
					container.style.height = size + 'px';
					table.layout(size, this.dimension.width - 10);
				},
				maximumSize: Number.POSITIVE_INFINITY,
				minimumSize: 176,
				onDidChange: Event.None
			}, 176);
		});
		this.layout(this.dimension);
	}

	layout(size: DOM.Dimension): void {
		this.dimension = size;
		this.splitview.layout(size.height);
	}
}
