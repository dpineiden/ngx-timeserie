import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Location, LocationStrategy, HashLocationStrategy } from '@angular/common';

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
    }

    ngOnInit() {
        this.chartType = 'time-serie'

    }

    updateData() {
        return {}
    }

    applyDimensions() {
        this.view = [this.width, this.height];
    }



}
