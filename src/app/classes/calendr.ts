
export class Calrendr {
  calendr: Calendr;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  configuration: CalrendrConfiguration;
  pngData: any;

  private configurableKeys: string[] = [
    'columns',
    'elementPadding',
    'paper.type',
    'paperPadding',
    'titleFont',
    'titleFontWeight',
    'titleHeight',
    'monthRenderer.dateWeight',
    'monthRenderer.dayWeight',
    'monthRenderer.fontFamily',
    'monthRenderer.fontWeight'
  ];

  configClone: any = {};

  constructor(calendr: Calendr, configuration: CalrendrConfiguration, canvas: HTMLCanvasElement) {
      this.calendr = calendr;
      this.canvas = canvas;
      this.context = canvas.getContext('2d') as CanvasRenderingContext2D;

      this.updateConfiguration(configuration);
  }

  updateConfiguration(configuration: CalrendrConfiguration) {




      if (!this.hasChanged(configuration)) {
        return;
      }
      this.configuration = configuration;
      this.cloneConfigurableValues();
      this.clearCanvas();

      this.configuration = configuration;
      this.canvas.width = this.configuration.paper.width;
      this.canvas.height = this.configuration.paper.height;

      this.canvas.style.width = `${this.configuration.paper.webWidth}px`;
      this.canvas.style.height = `${this.configuration.paper.webHeight}px`;

      setTimeout(() => {

        this.draw();
        this.pngData = this.canvas.toDataURL('image/png');
      }, 0);
  }

  private cloneConfigurableValues() {
      this.configClone = {};
      for (let i = 0; i < this.configurableKeys.length; i++) {
        const configKey = this.configurableKeys[i];
        this.setConfigKeyCloneValue(
          this.configClone,
          configKey,
          this.getConfigKeyCloneValue(this.configuration, configKey));
      }
  }

  hasChanged(config: CalrendrConfiguration): boolean {
      if (!this.configuration) {
        return true;
      }

      for (let i = 0; i < this.configurableKeys.length; i++) {
        const configKey = this.configurableKeys[i];



        if (this.getConfigKeyCloneValue(this.configClone, configKey) !== this.getConfigKeyCloneValue(config, configKey)) {
          return true;
        }
      }


      return false;
  }

  getConfigKeyCloneValue(complexObj: any, key: string): any {
    const splitStr = key.split('.');

    let value: any = complexObj;

    while (splitStr.length > 0) {
      const tempKey = splitStr.splice(0, 1)[0];
      value = value[tempKey];
    }

    return value;
  }

  setConfigKeyCloneValue(complexObj: any, key: string, value: any) {
    const splitStr = key.split('.');

    let holder: any = complexObj;

    while (splitStr.length > 0) {
      const tempKey = splitStr.splice(0, 1)[0];

      if ((holder[tempKey] === null || holder[tempKey] === undefined) && splitStr.length > 0 ) {
        holder[tempKey] = {};
        holder = holder[tempKey];
      } else if (splitStr.length > 0) {
        holder = holder[tempKey];
      } else {
        holder[tempKey] = value;
      }
    }
  }

  clearCanvas() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**_____________
   * |  [title]  |
   * |  mm   mm  |
   * |  mm   mm  |
   * |           |
   * |  mm   mm  |
   * |  mm   mm  |
   * |           |
   * |  mm   mm  |
   *  \/\/\/\/\/\/
   */


  draw() {
      this.drawCanvas();
      this.drawMonths();
      this.drawTitle();
  }

  drawCanvas() {
      this.context.fillStyle = 'white';
      this.context.fillRect(0, 0, this.configuration.paper.width, this.configuration.paper.height);

  }

  drawMonths() {
      // calculate rows from months
      this.configuration.rows = Math.ceil(12 / this.configuration.columns);

      for (let i = 0; i < this.calendr.months.length; i++) {
          const month = this.calendr.months[i];

          const col = i % this.configuration.columns;
          const row = Math.floor(i / this.configuration.columns) % this.configuration.rows;

          const monthX =
                  this.configuration.paperPadding +
                  col * this.configuration.monthWidth +
                  col * this.configuration.elementPadding;

          const monthY =
                  this.configuration.paperPadding +
                  this.configuration.titleHeight +
                  this.configuration.elementPadding +
                  row * this.configuration.monthHeight +
                  row * this.configuration.elementPadding;

          this.configuration.monthRenderer.setValues(
              this.context,
              month.month,
              month.year,
              monthX,
              monthY,
              this.configuration.monthWidth,
              this.configuration.monthHeight);

          this.configuration.monthRenderer.drawMonth();


      }
  }

  drawTitle() {

      const titleX = this.configuration.paperPadding;
      const titleY = this.configuration.paperPadding;

      this.context.fillStyle = '#EFEFEF';
      // this.context.fillRect(titleX, titleY, this.configuration.titleWidth, this.configuration.titleHeight);

      this.context.fillStyle = '#111';

      const text: string = 'TWO-THOUSAND + EIGHTEEN';



      const fontValue: string = ContextHelpers.getOptimalTextSize(this.context, text, this.configuration.titleFont, this.configuration.titleFontWeight, this.configuration.titleWidth, this.configuration.titleHeight);

      this.context.textBaseline = 'middle';
      this.context.textAlign = 'center';

      this.context.font = fontValue;
      this.context.fillText(text, titleX + (this.configuration.titleWidth / 2), titleY + (this.configuration.titleHeight/ 2));
  }
}

export interface ICalrendrConfiguration {

}

export class CalrendrConfiguration implements ICalrendrConfiguration {
  paper: IPaperSize;

  columns: number = 2;
  rows: number = 6;

  titleFont: string = 'Teko';
  titleFontWeight: string = 'bold';

  monthRenderer: IMonthRenderer;

  // Calculated dimensions
  get monthWidth(): number {
      return  (this.paper.width +
              -(this.paperPadding * 2) +
              -(this.elementPadding * (this.columns - 1))) / this.columns;
  }
  get monthHeight(): number {
      return  (this.paper.height +
              -(this.paperPadding * 2) +
              -this.elementPadding + // this is for the padding under title
              -this.titleHeight +
              -(this.elementPadding * (this.rows - 1))) / this.rows;
  }
  get titleWidth(): number{
      return  this.paper.width +
              -(this.paperPadding * 2);
  }
  titleHeight: number;
  paperPadding: number;
  elementPadding: number;

  constructor(paper: IPaperSize, monthRenderer: IMonthRenderer) {
      this.monthRenderer = monthRenderer;
      this.paper = paper;
      this.titleHeight = .1 * this.paper.height;
      this.paperPadding = .04 * this.paper.width;
      this.elementPadding = this.paperPadding;
  }
}

export class ContextHelpers {
  static getOptimalTextSize(context: CanvasRenderingContext2D, text: string, font: string, weight: string, containerWidth: number, containerHeight: number, padding: number = 0): string {
      const existingFont: string = context.font;

      const titleSize = this.getOptimalTextSizeValue(
          context,
          text,
          font,
          weight,
          containerWidth,
          containerHeight,
          padding
      );

      return `${weight} ${titleSize}px ${font}`;

  }

  static getFontSizeFromFontValue(fontValue: string): number {
      const pxIndex: number = fontValue.indexOf('px');
      const partial: string = fontValue.substr(0, pxIndex);
      const spaceIndex = partial.lastIndexOf(' ');

      if (spaceIndex === -1) {
          return parseInt(partial);
      }
      else {
          return parseInt(partial.substr(spaceIndex + 1, partial.length - 1));
      }
  }

  // tslint:disable-next-line:max-line-length
  static getOptimalTextSizeValue(context: CanvasRenderingContext2D, text: string, font: string, weight: string, containerWidth: number, containerHeight: number, padding: number = 0): number {

    const existingFont: string = context.font;
      containerWidth -= padding * 2;
      containerHeight -= padding * 2;
      let titlePxSize: number = containerHeight;
      context.font = `${weight} ${titlePxSize}px ${font}`;
      const txtMeasurement = context.measureText(text);

      const diffPercent = this.textInsideDiff(txtMeasurement, containerWidth, containerHeight);

      if (diffPercent > 1) {

      } else {
          titlePxSize = diffPercent * titlePxSize;
      }

      context.font = existingFont;

      return titlePxSize;
  }

  static getOptimalTextSizeForMultipleValues(context: CanvasRenderingContext2D, values: string[], font: string, weight: string, containerWidth: number, containerHeight: number, padding: number = 0): string {
      let smallestSize = containerHeight;
      for (let i = 0; i < values.length; i++) {
          const value = values[i];
          const size = this.getOptimalTextSizeValue(
              context,
              value,
              font,
              weight,
              containerWidth,
              containerHeight,
              padding
          )

          if (size < smallestSize) {
              smallestSize = size;
          }
      }

      return `${weight} ${smallestSize}px ${font}`;
  }

  static textInsideDiff(txtMeasurement: TextMetrics, width: number, height: number): number {
      const pctLarger: number = width / txtMeasurement.width;
      return pctLarger;
  }
}

export interface IMonthRenderer {
  context?: CanvasRenderingContext2D;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  month?: number;


  fontFamily: string;
  fontWeight: string;
  dayWeight: string;
  dateWeight: string;

  setValues(context: CanvasRenderingContext2D, month: number, year: number, x: number, y: number, width: number, height: number): void;
  drawMonth(): void;
}

export class SideMonthRenderer implements IMonthRenderer {
  /**
   * Interface implementation
   */
  context?: CanvasRenderingContext2D;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  month?: number;
  year?: number;

  fontFamily: string;
  fontWeight: string = '';
  dayWeight: string = '';
  dateWeight: string = '';

  startDay: number = 0;
  defaultP: number = 10;
  titlePadding: number = 0;
  gridP: number = 4;

  get titleWidth(): number {
      return .15 * this.width;
  }
  get titleHeight(): number {
      return this.height;
  }
  get calWidth(): number {
      return this.width - this.titleWidth;
  }
  get calHeight(): number {
      return this.height;
  }

  setValues(context: CanvasRenderingContext2D, month: number, year: number, x: number, y: number, width: number, height: number) {
      this.context = context;
      this.month = month;
      this.year = year;
      this.x = x;
      this.y = y;
      this.height = height;
      this.width = width;
  }

  drawMonth(): void {
      this.context.fillStyle = '#EFEFEF';
      // this.context.fillRect(this.x, this.y, this.width, this.height);

      this.drawMonthCalendar();

      this.drawMonthTitle();
  }

  drawMonthTitle(): void {
      // month width (/height) should be .15 of the width
      const titleWidth: number = this.titleWidth;
      const titleHeight: number = this.titleHeight;

      // this.context.fillStyle = '#111';
      this.context.fillStyle = '#666';

      const monthTitle: string = DateHelpers.getMonthName(this.month).toUpperCase();

      // month title
      const font: string = ContextHelpers.getOptimalTextSize(
          this.context,
          monthTitle,
          this.fontFamily,
          this.fontWeight,
          titleHeight,
          titleWidth,
          this.defaultP
      );

      this.context.textBaseline = 'top';
      this.context.textAlign = 'right';
      const angle: number = -Math.PI / 2;

      this.context.rotate(angle);
      this.context.font = font;
      this.context.fillText(
          monthTitle,
          -this.y - this.titlePadding,
          this.x);

      this.context.rotate(-angle);
  }

  drawMonthCalendar() {
      const dayRow: string[] = [];
      for (let i = this.startDay; i < 7 + this.startDay; i++) {
          const val: number = i % 7;
          dayRow.push(DateHelpers.getDayString(val).substr(0,1));
      }
      const cellWidth: number = this.calWidth / 7;
      const cellHeight: number = this.calHeight / 7;

      // day row
      let fontValue: string = ContextHelpers.getOptimalTextSizeForMultipleValues(
          this.context,
          dayRow,
          this.fontFamily,
          this.dayWeight,
          cellWidth,
          cellHeight,
          this.gridP);

      this.titlePadding =  (cellHeight - ContextHelpers.getFontSizeFromFontValue(fontValue)) / 2;
      console.log('dp', this.titlePadding);

      this.context.fillStyle = '#ccc';
      this.drawRow(dayRow, cellWidth, cellHeight, 0, fontValue);


      this.context.fillStyle = '#111';
      let done: boolean = false;

      let dateRow: string[] = [];
      const startDate = new Date(this.year, this.month, 1);

      // get fontValue for all. ideally this would be done once instead of every month being rendered
      const allDays: string[] = [];
      for (let i = 0; i < 31; i++) {
          allDays.push(i.toString());
      }
      fontValue = ContextHelpers.getOptimalTextSizeForMultipleValues(
          this.context,
          allDays,
          this.fontFamily,
          this.dateWeight,
          cellWidth,
          cellHeight,
          10);

      for (let i = 0; i < startDate.getDay(); i++) {
          dateRow.push('');
      }

      let row: number = 1;
      for (let i = new Date(this.year, this.month, 1); !done; i.setDate(i.getDate() + 1)) {
          if (this.month != i.getMonth()) {
              done = true;
          }
          else {
              dateRow.push(i.getDate().toString());
          }

          if (dateRow.length == 7 || done) {
              this.drawRow(
                  dateRow,
                  cellWidth,
                  cellHeight,
                  row,
                  fontValue
              );
              dateRow = [];
              row++;
          }
      }

      // console.log(dayRow);

  }

  drawRow(values: string[], cellWidth: number, cellHeight: number, row: number, fontValue: string) {
      for (let i = 0; i < values.length; i++) {
          const value = values[i];

          this.context.textBaseline = 'middle';
          this.context.textAlign = 'center';

          this.context.font = fontValue;
          this.context.fillText(
              value,
              this.x + this.titleWidth + i * cellWidth + cellWidth / 2,
              this.y + row * cellHeight + cellHeight / 2);
          }
  }

  /** Implementation specific */
  constructor() {}

}

export class Calendr {
  months: Month[] = [];

  constructor() {
      const date: Date = new Date(Date.now());
      for (let i = 0; i < 12; i++) {
          date.setMonth(date.getMonth() + 1);
          this.months.push(new Month(date.getMonth(), date.getFullYear()));
      }
  }
}

export class Month {
  month: number;
  year: number;
  constructor(month: number, year: number) {
      this.month = month;
      this.year = year;
  }


}

export interface IRenderer {

}

export enum PaperType {
  letter,
  legal,
  a2
}

export interface IPaperSize {
  type: PaperType;

  // returns pixels at 300 ppi
  width: number;
  height: number;

  // web sizes at 72 ppi
  webWidth: number;
  webHeight: number;
}

export class PaperProvider {
  static get letter(): IPaperSize {
      return new LetterPaper();
  }
  static get legal(): IPaperSize {
      return new LegalPaper();
  }
  static get a2(): IPaperSize {
      return new A2Paper();
  }

}

export class Quality {
  static readonly web: number = 72;
  static readonly print: number = 300;
}

export class DateHelpers {
  static getMonthName(monthIndex: number) {
      switch(monthIndex) {
          case 0:
              return 'January';
          case 1:
              return 'February';
          case 2:
              return 'March';
          case 3:
              return 'April';
          case 4:
              return 'May';
          case 5:
              return 'June';
          case 6:
              return 'July';
          case 7:
              return 'August';
          case 8:
              return 'September';
          case 9:
              return 'October';
          case 10:
              return 'November';
          case 11:
              return 'December';
      }
  }

  static getDayString(dayIndex: number): string {
      switch(dayIndex) {
          case 0:
              return 'Sunday';
          case 1:
              return 'Monday';
          case 2:
              return 'Tuesday';
          case 3:
              return 'Wednesday';
          case 4:
              return 'Thursday';
          case 5:
              return 'Friday';
          case 6:
              return 'Saturday';
      }
  }
}

export class LegalPaper implements IPaperSize {
  get type(): PaperType {
      return PaperType.legal;
  }
  get webWidth(): number {
      return 612;
  }
  get webHeight(): number {
      return 20 * 72;
  }
  get width(): number {
      return this.webWidth * 300 / 72;
  }
  get height(): number {
      return this.webHeight * 300 / 72;
  }
}

export class A2Paper implements IPaperSize {
  get type(): PaperType {
      return PaperType.a2;
  }
  get webWidth(): number {
      return 16.53 * 72;
  }
  get webHeight(): number {
      return 23.39 * 72;
  }
  get width(): number {
      return this.webWidth * 300 / 72;
  }
  get height(): number {
      return this.webHeight * 300 / 72;
  }
}

class LetterPaper implements IPaperSize {
  get type(): PaperType {
      return PaperType.letter;
  }
  get webWidth(): number {
      return 612;
  }
  get webHeight(): number {
      return 792;
  }
  get width(): number {
      return this.webWidth * 300 / 72;
  }
  get height(): number {
      return this.webHeight * 300 / 72;
  }
}
