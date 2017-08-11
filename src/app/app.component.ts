import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Location, LocationStrategy, HashLocationStrategy } from '@angular/common';

// source of data
import { data as countries } from 'emoji-flags';
import { barChart, lineChartSeries } from './combo-chart-data';
import { single, multi, bubble, generateData, generateGraph, treemap, timelineFilterBarData } from './data';

@Component({
    selector: 'app-root',
    providers: [Location, { provide: LocationStrategy, useClass: HashLocationStrategy }],
    encapsulation: ViewEncapsulation.None,
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    title = 'App';
    chart_name: string = 'time-serie';
    chart: any;
    chartType: string
    view: any[];
    width: number = 1200;
    height: number = 800;
    data: {};
    countries: any[];
    single: any[];
    realTimeData: boolean = false;

    chartGroups = [
        {
            name: 'Time Serie Chart',
            charts: [
                {
                    name: 'Time Serie Chart',
                    selector: 'time-serie',
                    options: [],
                    defaults: {}
                }
            ]
        },
    ]

    constructor(public location: Location) {
        // load data to principal component
        console.log("Constructor")
        //Object.assign(this, { tree_example })
        //this.data = tree_example
        Object.assign(this, { countries, single })
    }

    ngOnInit() {
        this.chartType = 'time-serie'

    }

    updateData() {
        if (!this.realTimeData) {
            return;
        }
        const add = Math.random() < 0.7;
        const remove = Math.random() < 0.5;
        const country = this.countries[Math.floor(Math.random() * this.countries.length)];
        if (add) {
            // single
            const entry = {
                name: country.name,
                value: Math.floor(10000 + Math.random() * 50000)
            };
            this.single = [...this.single, entry];
        }

    }

    applyDimensions() {
        this.view = [this.width, this.height];
    }


    getFlag(country) {
        return this.countries.find(c => c.name === country).emoji;
    }


}
