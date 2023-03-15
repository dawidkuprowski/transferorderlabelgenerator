export class Label {
    constructor (id, date, time, anc, qty, from_st, from_bin, to_st, to_bin, tr_order, tr_item, material_description, user, unit) {
        this.id = id;
        this.date = new Date(((date) - 25569) * 86400 * 1000).toLocaleDateString("pl-PL", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });

        const _date = new Date(((date) - 25569) * 86400 * 1000);
        this.weekNumber = this.getWeekNumber(_date);

        this.time = this.formatedTime(time);
        this.normalAnc = anc;
        this.anc = anc.replace(/(.{3})/g, '$1 ');
        this.qty = qty;
        this.from_st = from_st;
        this.from_bin = from_bin;
        this.to_st = to_st;
        this.to_bin = to_bin.padStart(8, '0').replace(/\d{2}(?!$)/g, "$& ");
        this.tr_order = tr_order.padStart(10, '0');
        this.tr_item = tr_item.padStart(4, '0');
        this.material_description = material_description;
        this.user = user;
        this.unit = unit;
    }

    getWeekNumber(date) {
        const onejan = new Date(date.getFullYear(), 0, 1);
        const weekNum = Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1) / 7);
        if (date.getDay() === 0 && weekNum !== 1) {
          return weekNum - 1;
        }
        return weekNum;
    }

    formatedTime (time) {
        const hour = time * 24;
        const roundedHour = Math.floor(hour);
        const minute = Math.floor((hour - roundedHour) * 60);
        const second = Math.floor((((hour - roundedHour) * 60) - minute) * 60);
        return `${String(roundedHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
    }
    
    getLayout () {
        return `
        <div class="label_container">
            <div class="row">
                <div class="col">
                    <div class="col p0">
                        <span class="fs-2 fw-7 text-center">${this.date}</span>
                    </div>
                    <div class="col p0">
                        <span class="fs-2 fw-5 text-center">${this.time}</span>
                    </div>
                </div>
                <div class="border_col"></div>
                <div class="col flex-100 gap-1">
                    <div class="col p0">
                        <span class="fs-2 fw-7 text-center">${this.material_description}</span>
                    </div>
                </div>
                <div class="border_col"></div>
                <div class="col">
                    <div class="col p0">
                        <span class="fs-2 fw-6 text-center" style="word-break: break-all;">${this.user}</span>
                    </div>
                </div>
            </div>
            <div class="border_row"></div>
            <div class="row">
                <div class="col flex-100">
                    <div class="col p0">
                        <span class="fs-3 fw-6">ANC</span>
                    </div>
                    <div class="col p0">
                        <span class="fs-9 fw-7 text-center">${this.anc}</span>
                    </div>
                </div>
                <div class="border_col"></div>
                <div class="col p05" id="qrANC_${this.id}">
                    
                </div>
            </div>
            <div class="border_row"></div>
            <div class="row">
                <div class="col p05" id="qrQTY_${this.id}">
                    
                </div>
                <div class="border_col"></div>
                <div class="col flex-100">
                    <div class="col p0">
                        <span class="fs-3 fw-6">QTY</span>
                    </div>
                    <div class="col p0">
                        <span class="fs-9 fw-7 text-center">${this.qty} ${this.unit}</span>
                    </div>
                </div>
            </div>
            <div class="border_row"></div>
            <div class="row">
                <div class="col">
                    <div class="col p0">
                        <span class="fs-3 fw-6">TO</span>
                    </div>
                    <div class="col p0">
                        <span class="fs-6 fw-7 text-center">${this.to_st}</span>
                    </div>
                </div>
                <div class="col flex-100">
                    <div class="col p0">
                        <span class="fs-11 fw-7 text-center">${this.to_bin}</span>
                    </div>
                </div>
                <div class="border_col"></div>
                <div class="col p05" id="qrTO_BIN_${this.id}">
                        
                </div>
            </div>
            <div class="border_row"></div>
            <div class="row">
                <div class="col p05" id="qrTR_ORDER_ITEM_${this.id}">
                            
                </div>
                <div class="border_col"></div>
                <div class="col flex-100">
                    <div class="col p0">
                        <span class="fs-3 fw-6">TR.ORDER / ITEM</span>
                    </div>
                    <div class="col p0">
                        <span class="fs-6 fw-7 text-center">${this.tr_order} / ${this.tr_item}</span>
                    </div>
                </div>
                <div class="border_col"></div>
                <div class="col">
                    <div class="col p0">
                        <span class="fs-3 fw-6">WEEK</span>
                    </div>
                    <div class="col p0">
                        <span class="fs-6 fw-7 text-center">${this.weekNumber}</span>
                    </div>
                </div>
            </div>
        </div>
        `;
    }
}