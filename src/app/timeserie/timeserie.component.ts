import {
    Component,
    Input,
    Output,
    EventEmitter,
    ViewEncapsulation,
    HostListener,
    ChangeDetectionStrategy,
    ContentChild,
    TemplateRef,
} from '@angular/core';

import {
    trigger,
    state,
    style,
    animate,
    transition
} from '@angular/animations';


import { PathLocationStrategy } from '@angular/common';
import { scaleLinear, scaleTime, scalePoint } from 'd3-scale';
import { curveNatural as D3_curve } from 'd3-shape';
// ref:https://github.com/d3/d3-shape#curveLinear

//import { BaseChartComponent } from '../common/base-chart.component';

import { BaseChartComponent } from '@swimlane/ngx-charts'
import { calculateViewDimensions, ViewDimensions } from '@swimlane/ngx-charts';
import { ColorHelper } from '@swimlane/ngx-charts';

import { idm_in_list } from '../utils/idm';

@Component({
    selector: 'ngx-timeserie',
    templateUrl: './templates/timeserie.component.html',
    styleUrls: ['./static/css/timeserie.styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('animationState', [
            transition(':leave', [
                style({
                    opacity: 1,
                }),
                animate(500, style({
                    opacity: 0
                }))
            ])
        ])
    ]
})

export class TimeSerieComponent extends BaseChartComponent {

    // amount of chars for idm

    n_id: number = 4;

    setNid(n: number) {
        this.n_id = n | 0 // convert to int
    }

    getNid() {
        return this.n_id
    }

    // list for idm

    id_list: string[];

    // input properties for the svg template
    @Input() width: number;
    @Input() height: number;
    @Input() legend;
    @Input() legendTitle: string = 'Legend';
    @Input() xAxis;
    @Input() yAxis;
    @Input() showXAxisLabel;
    @Input() showYAxisLabel;
    @Input() xAxisLabel;
    @Input() yAxisLabel;
    @Input() autoScale;
    @Input() timeline;
    @Input() gradient: boolean;
    @Input() showGridLines: boolean = true;
    @Input() curve: any = D3_curve;
    @Input() activeEntries: any[] = [];
    @Input() schemeType: string;
    @Input() rangeFillOpacity: number;
    @Input() xAxisTickFormatting: any;
    @Input() yAxisTickFormatting: any;
    @Input() roundDomains: boolean = false;
    @Input() tooltipDisabled: boolean = false;
    @Input() showRefLines: boolean = false;
    @Input() referenceLines: any;
    @Input() showRefLabels: boolean = true;

    @Output() activate: EventEmitter<any> = new EventEmitter();
    @Output() deactivate: EventEmitter<any> = new EventEmitter();

    @ContentChild('tooltipTemplate') tooltipTemplate: TemplateRef<any>;
    @ContentChild('seriesTooltipTemplate') seriesTooltipTemplate: TemplateRef<any>;

    dims: ViewDimensions;
    xSet: any;
    xDomain: any;
    yDomain: any;
    seriesDomain: any;
    yScale: any;
    xScale: any;
    colors: ColorHelper;
    scaleType: string;
    transform: string;
    clipPath: string;
    clipPathId: string;
    series: any;
    areaPath: any;
    margin = [10, 20, 10, 20];
    hoveredVertical: any; // the value of the x axis that is hovered over
    xAxisHeight: number = 0;
    yAxisWidth: number = 0;
    filteredDomain: any;
    legendOptions: any;
    hasRange: boolean; // whether the line has a min-max range around it
    timelineWidth: any;
    timelineHeight: number = 50;
    timelineXScale: any;
    timelineYScale: any;
    timelineXDomain: any;
    timelineTransform: any;
    timelinePadding: number = 10;

    // main function to update 
    update(): void {
        super.update();

        this.dims = calculateViewDimensions({
            width: this.width,
            height: this.height,
            margins: this.margin,
            showXAxis: this.xAxis,
            showYAxis: this.yAxis,
            xAxisHeight: this.xAxisHeight,
            yAxisWidth: this.yAxisWidth,
            showXLabel: this.showXAxisLabel,
            showYLabel: this.showYAxisLabel,
            showLegend: this.legend,
            legendType: this.schemeType,
        });

        if (this.timeline) {
            this.dims.height -= (this.timelineHeight + this.margin[2] + this.timelinePadding);
        }

        this.xDomain = this.getXDomain();
        if (this.filteredDomain) {
            this.xDomain = this.filteredDomain;
        }

        this.yDomain = this.getYDomain();
        this.seriesDomain = this.getSeriesDomain();

        this.xScale = this.getXScale(this.xDomain, this.dims.width);
        this.yScale = this.getYScale(this.yDomain, this.dims.height);

        this.updateTimeline();

        this.setColors();
        this.legendOptions = this.getLegendOptions();

        this.transform = `translate(${this.dims.xOffset} , ${this.margin[0]})`;


        const pageUrl = this.location instanceof PathLocationStrategy
            ? this.location.path()
            : '';

        this.clipPathId = 'clip' + idm_in_list(this.n_id, this.id_list);
        this.clipPath = `url(${pageUrl}#${this.clipPathId})`;


    }


    updateTimeline(): void {
        if (this.timeline) {
            this.timelineWidth = this.width;

            if (this.legend) {
                this.timelineWidth = this.dims.width;
            }

            this.timelineXDomain = this.getXDomain();
            this.timelineXScale = this.getXScale(this.timelineXDomain, this.timelineWidth);
            this.timelineYScale = this.getYScale(this.yDomain, this.timelineHeight);
            this.timelineTransform = `translate(${this.dims.xOffset}, ${-this.margin[2]})`;
        }
    }

    getXDomain(): any[] {
        let values = [];

        for (const results of this.results) {
            for (const d of results.series) {
                if (!values.includes(d.name)) {
                    values.push(d.name);
                }
            }
        }
        this.scaleType = this.getScaleType(values);
        let domain = [];

        if (this.scaleType === 'time') {
            const min = Math.min(...values);
            const max = Math.max(...values);
            domain = [new Date(min), new Date(max)];
            this.xSet = [...values].sort((a, b) => {
                const aDate = a.getTime();
                const bDate = b.getTime();
                if (aDate > bDate) return 1;
                if (bDate > aDate) return -1;
                return 0;
            });
        } else if (this.scaleType === 'linear') {
            values = values.map(v => Number(v));
            const min = Math.min(...values);
            const max = Math.max(...values);
            domain = [min, max];
            this.xSet = [...values].sort();
        } else {
            domain = values;
            this.xSet = values;
        }

        return domain;
    }

    getYDomain(): any[] {
        const domain = [];
        for (const results of this.results) {
            for (const d of results.series) {
                if (domain.indexOf(d.value) < 0) {
                    domain.push(d.value);
                }
                if (d.min !== undefined) {
                    this.hasRange = true;
                    if (domain.indexOf(d.min) < 0) {
                        domain.push(d.min);
                    }
                }
                if (d.max !== undefined) {
                    this.hasRange = true;
                    if (domain.indexOf(d.max) < 0) {
                        domain.push(d.max);
                    }
                }
            }
        }

        let min = Math.min(...domain);
        const max = Math.max(...domain);
        if (!this.autoScale) {
            min = Math.min(0, min);
        }

        return [min, max];
    }

    getSeriesDomain(): any[] {
        return this.results.map(d => d.name);
    }


    getXScale(domain, width): any {
        let scale;

        if (this.scaleType === 'time') {
            scale = scaleTime()
                .range([0, width])
                .domain(domain);
        } else if (this.scaleType === 'linear') {
            scale = scaleLinear()
                .range([0, width])
                .domain(domain);

            if (this.roundDomains) {
                scale = scale.nice();
            }
        } else if (this.scaleType === 'ordinal') {
            scale = scalePoint()
                .range([0, width])
                .padding(0.1)
                .domain(domain);
        }

        return scale;
    }

    getYScale(domain, height): any {
        const scale = scaleLinear()
            .range([height, 0])
            .domain(domain);

        return this.roundDomains ? scale.nice() : scale;
    }


    getScaleType(values): string {
        let date = true;
        let num = true;

        for (const value of values) {
            if (!this.isDate(value)) {
                date = false;
            }

            if (typeof value !== 'number') {
                num = false;
            }
        }

        if (date) return 'time';
        if (num) return 'linear';
        return 'ordinal';
    }

    isDate(value): boolean {
        if (value instanceof Date) {
            return true;
        }

        return false;
    }

    updateDomain(domain): void {
        this.filteredDomain = domain;
        this.xDomain = this.filteredDomain;
        this.xScale = this.getXScale(this.xDomain, this.dims.width);
    }

    updateHoveredVertical(item): void {
        this.hoveredVertical = item.value;
        this.deactivateAll();
    }

    @HostListener('mouseleave')
    hideCircles(): void {
        this.hoveredVertical = null;
        this.deactivateAll();
    }

    onClick(data, series?): void {
        if (series) {
            data.series = series.name;
        }

        this.select.emit(data);
    }

    trackBy(index, item): string {
        return item.name;
    }

    setColors(): void {
        let domain;
        if (this.schemeType === 'ordinal') {
            domain = this.seriesDomain;
        } else {
            domain = this.yDomain;
        }

        this.colors = new ColorHelper(this.scheme, this.schemeType, domain, this.customColors);
    }

    getLegendOptions() {
        const opts = {
            scaleType: this.schemeType,
            colors: undefined,
            domain: [],
            title: undefined
        };
        if (opts.scaleType === 'ordinal') {
            opts.domain = this.seriesDomain;
            opts.colors = this.colors;
            opts.title = this.legendTitle;
        } else {
            opts.domain = this.yDomain;
            opts.colors = this.colors.scale;
        }
        return opts;
    }

    updateYAxisWidth({ width }): void {
        this.yAxisWidth = width;
        this.update();
    }

    updateXAxisHeight({ height }): void {
        this.xAxisHeight = height;
        this.update();
    }

    onActivate(item) {
        this.deactivateAll();

        const idx = this.activeEntries.findIndex(d => {
            return d.name === item.name && d.value === item.value;
        });
        if (idx > -1) {
            return;
        }

        this.activeEntries = [item];
        this.activate.emit({ value: item, entries: this.activeEntries });
    }

    onDeactivate(item) {
        const idx = this.activeEntries.findIndex(d => {
            return d.name === item.name && d.value === item.value;
        });

        this.activeEntries.splice(idx, 1);
        this.activeEntries = [...this.activeEntries];

        this.deactivate.emit({ value: item, entries: this.activeEntries });
    }

    deactivateAll() {
        this.activeEntries = [...this.activeEntries];
        for (const entry of this.activeEntries) {
            this.deactivate.emit({ value: entry, entries: [] });
        }
        this.activeEntries = [];
    }


}