import { NgModule } from '@angular/core';

import { ChartCommonModule } from '@swimlane/ngx-charts';

import { TimeSerieComponent } from './timeserie.component';


export { TimeSerieComponent };


@NgModule({
    imports: [ChartCommonModule],
    declarations: [TimeSerieComponent],
    exports: [TimeSerieComponent]
})

export class TimeSerieModule { }

